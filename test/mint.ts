import { ethers, upgrades } from "hardhat"
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers"
import { expect } from "chai"
import { decimal } from "../utils/decimal"

export const shouldBehaveLikeMint = async () => {
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

	it("only the owner can mint tokens", async () => {
		await expect(wpac.connect(alice).mint(bob.address, decimal(10))).to.be.revertedWith("Ownable: caller is not the owner")
	})

	it("correct amount of tokens is minted to the specified address", async () => {
		await wpac.mint(alice.address, decimal(10))
		expect(await wpac.balanceOf(alice.address)).to.be.equal(decimal(10))
	})

	it("correct amount of tokens is minted to the specified address", async () => {
		await expect(wpac.connect(owner).mint(ethers.ZeroAddress, decimal(10))).to.be.revertedWith("ERC20: mint to the zero address")
	})
}
