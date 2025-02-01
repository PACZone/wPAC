import { ethers, upgrades } from "hardhat"
import { loadAddresses, saveAddresses } from "../utils/file"

const UPGRADEABLE_PROXY = loadAddresses().proxy

async function main() {
	if (!UPGRADEABLE_PROXY) throw new Error("Cannot load UPGRADEABLE_PROXY!")

	const V2Contract = await ethers.getContractFactory("WrappedPAC")

	await upgrades.forceImport(UPGRADEABLE_PROXY, V2Contract)

	// Verify current implementation
	const currentImplementation = await upgrades.erc1967.getImplementationAddress(UPGRADEABLE_PROXY)
	console.log("Current Implementation Address:", currentImplementation)

	console.log("Upgrading Contract...")

	// Force deploy new implementation if necessary
	const newImplementation = await upgrades.deployImplementation(V2Contract)
	console.log("New Implementation Deployed At:", newImplementation)

	if (currentImplementation === newImplementation) {
		throw new Error("New implementation matches the current implementation. No upgrade needed.")
	}

	// Perform the upgrade
	let upgrade = await upgrades.upgradeProxy(UPGRADEABLE_PROXY, V2Contract)
	await upgrade.waitForDeployment()

	console.log("Successfully upgraded ✅")
	console.log("New Contract Deployed To:", upgrade.address)

	setInterval(() => {}, 15000)

	const addresses = {
		proxy: UPGRADEABLE_PROXY,
		admin: await upgrades.erc1967.getAdminAddress(await upgrade.getAddress()),
		implementation: await upgrades.erc1967.getImplementationAddress(await upgrade.getAddress()),
	}

	saveAddresses(addresses)
}

main().catch(error => {
	console.error(error)
	process.exitCode = 1
})
