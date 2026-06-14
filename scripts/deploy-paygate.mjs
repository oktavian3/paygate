import { ethers } from "ethers";
import { readFileSync } from "fs";

const USDC_ADDRESS = "0x3600000000000000000000000000000000000000";

async function main() {
  const rpc = process.env.ARC_TESTNET_RPC_URL || "https://rpc.testnet.arc.network";
  const pk = process.env.ARC_PRIVATE_KEY;
  if (!pk) throw new Error("ARC_PRIVATE_KEY not set");

  const provider = new ethers.JsonRpcProvider(rpc);
  const signer = new ethers.Wallet(pk, provider);

  // Read compiled artifact
  const artifact = JSON.parse(
    readFileSync(new URL("../artifacts/contracts/PayGateEscrow.sol/PayGateEscrow.json", import.meta.url), "utf8")
  );

  console.log(`Deploying with account: ${signer.address}...`);
  const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, signer);
  const escrow = await factory.deploy(USDC_ADDRESS, signer.address);
  await escrow.waitForDeployment();

  const address = await escrow.getAddress();
  console.log(`NEXT_PUBLIC_PAYGATE_ESCROW_ADDRESS=${address}`);
  console.log(`ARC_EXPLORER=https://testnet.arcscan.app/address/${address}`);
  console.log(`Deploy tx: ${escrow.deploymentTransaction().hash}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
