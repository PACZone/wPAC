import { ethers, upgrades } from "hardhat"
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers"
import { expect } from "chai"

export const shouldBehaveLikeFee = async () => {
	let wpac: any
	let owner: SignerWithAddress

	before(async () => {
		const signers = await ethers.getSigners()
		owner = signers[0]
		const Factory = await ethers.getContractFactory("WrappedPAC")
		const WPAC = await upgrades.deployProxy(Factory, undefined, { initializer: "initialize" })
		wpac = await WPAC.waitForDeployment()
	})

	it("should calculate correct fee", async () => {
		expect(await wpac.getFee(1_903_076_060_983)).to.be.equal(5_000_000_000)
		expect(await wpac.getFee(2_874_345_000)).to.be.equal(1_000_000_000)
		expect(await wpac.getFee(200e9)).to.be.equal(1e9)
	})
}
