import { ethers, upgrades } from "hardhat"
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers"
import { expect } from "chai"
import { decimal } from "../utils/decimal"
import { WrappedPAC } from "../src/types"

export const shouldBehaveLikeWithdrawFee = async () => {
	let wpac: WrappedPAC
	let owner: SignerWithAddress, alice: SignerWithAddress, bob: SignerWithAddress, minter: SignerWithAddress, feeCollector: SignerWithAddress

	before(async () => {
		const signers = await ethers.getSigners()

		owner = signers[0]
		alice = signers[1]
		bob = signers[2]
		minter = signers[3]
		feeCollector = signers[4]

		const Factory = await ethers.getContractFactory("WrappedPAC")
		const WPAC = await upgrades.deployProxy(Factory, undefined, { initializer: "initialize" })
		wpac = await WPAC.waitForDeployment()

		await wpac.setMinterRole(minter)
		await wpac.setFeeCollectorRole(feeCollector)

		await wpac.connect(minter).mint(bob.address, decimal(100))
	})

	it("should only the fee collector withdraw fee", async () => {
		await expect(wpac.connect(alice).withdrawFee()).to.be.revertedWith(/\bAccessControl\b/)
	})

	it("should withdraw fee balance to fee collector", async () => {
		await wpac.connect(minter).mint(wpac.target, decimal(10))
		await wpac.connect(feeCollector).withdrawFee()
		expect(await wpac.balanceOf(feeCollector.address)).to.be.equal(decimal(10))
	})
}
