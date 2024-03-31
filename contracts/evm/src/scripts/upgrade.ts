import { ethers, upgrades } from "hardhat"
import { loadAddresses, saveAddresses } from "../../utils/file"

const UPGRADEABLE_PROXY = loadAddresses().proxy
//0x22553d0734E9B80E2f59E67eB2feE05C16143279

async function main() {
	if (!UPGRADEABLE_PROXY) throw new Error("can not load UPGRADEABLE_PROXY!")
	const V2Contract = await ethers.getContractFactory("WrappedPAC")
	console.log("Upgrading Contract...")
	let upgrade = await upgrades.upgradeProxy(UPGRADEABLE_PROXY, V2Contract)
	await upgrade.waitForDeployment()
	console.log("Successfully upgrade✅")
	console.log("New Contract Deployed To:", upgrade.address)

	const addr = await upgrade.getAddress()

	const addresses = {
		proxy: UPGRADEABLE_PROXY,
		admin: await upgrades.erc1967.getAdminAddress(addr),
		implementation: await upgrades.erc1967.getImplementationAddress(addr),
	}

	saveAddresses(addresses)
}

main().catch(error => {
	console.error(error)
	process.exitCode = 1
})
