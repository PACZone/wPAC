import { ethers, run, upgrades } from "hardhat"

const UPGRADEABLE_PROXY = "0x22553d0734E9B80E2f59E67eB2feE05C16143279";

async function main() {
//    const gas = await ethers.provider.gas()
   const V2Contract = await ethers.getContractFactory("WrappedPAC");
   console.log("Upgrading V1Contract...");
   let upgrade = await upgrades.upgradeProxy(UPGRADEABLE_PROXY, V2Contract);
   await upgrade.waitForDeployment()
   console.log("V1 Upgraded to V2");
   console.log("V2 Contract Deployed To:", upgrade.address)
}

main().catch((error) => {
   console.error(error);
   process.exitCode = 1;
 });