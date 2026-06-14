// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract PayGateEscrow is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    enum DealStatus {
        Active,
        WorkerSubmitted,
        InDispute,
        Completed,
        AutoReleased,
        Cancelled
    }

    struct Deal {
        address client;
        address worker;
        uint256 amount;
        uint8 mode;
        uint256 deadline;
        bytes32 deliverableHash;
        DealStatus status;
        bool workerSubmitted;
        bool clientApproved;
        uint256 createdAt;
        uint256 disputeRaisedAt;
    }

    IERC20 public immutable usdc;
    uint256 public nextDealId = 1;
    mapping(uint256 => Deal) public deals;
    mapping(uint256 => bytes32) public proofHashes;
    mapping(uint256 => bytes32) public disputeEvidenceHashes;
    mapping(uint256 => string) public disputeReasons;

    event DealCreated(uint256 indexed dealId, address indexed client, address indexed worker, uint256 amount, uint8 mode, uint256 deadline, bytes32 deliverableHash);
    event DeliverySubmitted(uint256 indexed dealId, bytes32 proofHash);
    event DeliveryApproved(uint256 indexed dealId, uint256 amount);
    event DisputeRaised(uint256 indexed dealId, address indexed raisedBy, bytes32 evidenceHash, string reason);
    event DisputeResolved(uint256 indexed dealId, address indexed winner, uint256 amount);
    event DisputeFallbackSplit(uint256 indexed dealId, uint256 clientAmount, uint256 workerAmount);
    event DealAutoReleased(uint256 indexed dealId, uint256 amount);

    modifier onlyClient(uint256 dealId) {
        require(msg.sender == deals[dealId].client, "PayGate: not client");
        _;
    }

    modifier onlyWorker(uint256 dealId) {
        require(msg.sender == deals[dealId].worker, "PayGate: not worker");
        _;
    }

    modifier onlyParticipant(uint256 dealId) {
        require(msg.sender == deals[dealId].client || msg.sender == deals[dealId].worker, "PayGate: not participant");
        _;
    }

    constructor(address usdcAddress, address initialOwner) Ownable(initialOwner) {
        require(usdcAddress != address(0), "PayGate: zero usdc");
        usdc = IERC20(usdcAddress);
    }

    function createDeal(
        address worker,
        uint256 amount,
        uint8 mode,
        uint256 deadline,
        bytes32 deliverableHash
    ) external nonReentrant returns (uint256 dealId) {
        require(worker != address(0) && worker != msg.sender, "PayGate: invalid worker");
        require(amount > 0, "PayGate: zero amount");
        require(mode <= 2, "PayGate: invalid mode");
        require(deadline > block.timestamp, "PayGate: invalid deadline");
        require(deliverableHash != bytes32(0), "PayGate: empty hash");

        dealId = nextDealId++;
        deals[dealId] = Deal({
            client: msg.sender,
            worker: worker,
            amount: amount,
            mode: mode,
            deadline: deadline,
            deliverableHash: deliverableHash,
            status: DealStatus.Active,
            workerSubmitted: false,
            clientApproved: false,
            createdAt: block.timestamp,
            disputeRaisedAt: 0
        });
        usdc.safeTransferFrom(msg.sender, address(this), amount);
        emit DealCreated(dealId, msg.sender, worker, amount, mode, deadline, deliverableHash);
    }

    function submitDelivery(uint256 dealId, bytes32 proofHash) external onlyWorker(dealId) {
        Deal storage deal = deals[dealId];
        require(deal.status == DealStatus.Active, "PayGate: not active");
        require(proofHash != bytes32(0), "PayGate: empty proof");
        deal.workerSubmitted = true;
        deal.status = DealStatus.WorkerSubmitted;
        proofHashes[dealId] = proofHash;
        emit DeliverySubmitted(dealId, proofHash);
    }

    function approveDelivery(uint256 dealId) external nonReentrant onlyClient(dealId) {
        Deal storage deal = deals[dealId];
        require(deal.status == DealStatus.WorkerSubmitted, "PayGate: not submitted");
        deal.clientApproved = true;
        deal.status = DealStatus.Completed;
        usdc.safeTransfer(deal.worker, deal.amount);
        emit DeliveryApproved(dealId, deal.amount);
    }

    function raiseDispute(uint256 dealId, bytes32 evidenceHash, string calldata reason) external onlyParticipant(dealId) {
        Deal storage deal = deals[dealId];
        require(deal.status == DealStatus.Active || deal.status == DealStatus.WorkerSubmitted, "PayGate: cannot dispute");
        require(evidenceHash != bytes32(0), "PayGate: empty evidence");
        deal.status = DealStatus.InDispute;
        deal.disputeRaisedAt = block.timestamp;
        disputeEvidenceHashes[dealId] = evidenceHash;
        disputeReasons[dealId] = reason;
        emit DisputeRaised(dealId, msg.sender, evidenceHash, reason);
    }

    function resolveDispute(uint256 dealId, address winnerAddress) external onlyOwner nonReentrant {
        Deal storage deal = deals[dealId];
        require(deal.status == DealStatus.InDispute, "PayGate: not disputed");
        require(winnerAddress == deal.client || winnerAddress == deal.worker, "PayGate: invalid winner");
        deal.status = DealStatus.Completed;
        usdc.safeTransfer(winnerAddress, deal.amount);
        emit DisputeResolved(dealId, winnerAddress, deal.amount);
    }

    function fallbackSplit(uint256 dealId) external nonReentrant {
        Deal storage deal = deals[dealId];
        require(deal.status == DealStatus.InDispute, "PayGate: not disputed");
        require(block.timestamp > deal.disputeRaisedAt + 7 days, "PayGate: too early");
        deal.status = DealStatus.Completed;
        uint256 clientAmount = deal.amount / 2;
        uint256 workerAmount = deal.amount - clientAmount;
        usdc.safeTransfer(deal.client, clientAmount);
        usdc.safeTransfer(deal.worker, workerAmount);
        emit DisputeFallbackSplit(dealId, clientAmount, workerAmount);
    }

    function autoRelease(uint256 dealId) external nonReentrant {
        Deal storage deal = deals[dealId];
        require(deal.status == DealStatus.WorkerSubmitted, "PayGate: not submitted");
        require(block.timestamp > deal.deadline + 5 days, "PayGate: too early");
        require(!deal.clientApproved, "PayGate: approved");
        deal.status = DealStatus.AutoReleased;
        usdc.safeTransfer(deal.worker, deal.amount);
        emit DealAutoReleased(dealId, deal.amount);
    }

    function getDeliverableHash(uint256 dealId) external view returns (bytes32) {
        return deals[dealId].deliverableHash;
    }
}
