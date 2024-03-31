import { ethers, upgrades } from "hardhat"
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers"
import { expect } from "chai"
import { decimal } from "../utils/decimal"

export const shouldBehaveLikeWithdrawFee = async () => {
	let wpac: any
	let owner: SignerWithAddress, alice: SignerWithAddress, bob: SignerWithAddress

	before(async () => {
		const signers = await ethers.getSigners()

		owner = signers[0]
		alice = signers[1]
		bob = signers[2]

		const Factory = await ethers.getContractFactory("WrappedPAC")
		const WPAC = await upgrades.deployProxy(Factory, undefined, { initializer: "initialize" })
		wpac = await WPAC.waitForDeployment()
	})

	it("should only the owner can mint tokens", async () => {
		await expect(wpac.connect(alice).withdrawFee()).to.be.revertedWith("Ownable: caller is not the owner")
	})

	it("should transfer contract balance to admin", async () => {
		await wpac.mint(wpac.target, decimal(10))
		await wpac.withdrawFee()
		expect(await wpac.balanceOf(owner.address)).to.be.equal(decimal(10))
	})
}
