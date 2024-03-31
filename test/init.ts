import { ethers, upgrades } from "hardhat"
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers"
import { expect } from "chai"
import { decimal } from "../utils/decimal"

export const shouldBehaveLikeInitialize = async () => {
	let wpac: any
	let owner: SignerWithAddress

	before(async () => {
		const signers = await ethers.getSigners()
		owner = signers[0]
		const Factory = await ethers.getContractFactory("WrappedPAC")
		const WPAC = await upgrades.deployProxy(Factory, undefined, { initializer: "initialize" })
		wpac = await WPAC.waitForDeployment()
	})

	it("should init correct", async () => {
		expect(await wpac.owner()).to.be.equal(owner.address)
		expect(await wpac.FEE()).to.be.equal(decimal(1))
		expect(await wpac.counter()).to.be.equal(0)
		expect(await wpac.decimals()).to.be.equal(9)
        expect(await wpac.paused()).to.be.equal(false)
	})
}
