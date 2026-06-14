import hre from "hardhat";

const USDC_ADDRESS = "0x3600000000000000000000000000000000000000";

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const factory = await hre.ethers.getContractFactory("PayGateEscrow");
  const escrow = await factory.deploy(USDC_ADDRESS, deployer.address);
  await escrow.waitForDeployment();

  const address = await escrow.getAddress();
  console.log(`NEXT_PUBLIC_PAYGATE_ESCROW_ADDRESS=${address}`);
  console.log(`ARC_EXPLORER=https://testnet.arcscan.app/address/${address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
