import { ethers, upgrades } from "hardhat"
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers"
import { expect } from "chai"
import { decimal } from "../utils/decimal"
import { WrappedPAC } from "../src/types"

export const shouldBehaveLikeMint = async () => {
	let wpac: WrappedPAC
	let owner: SignerWithAddress, alice: SignerWithAddress, bob: SignerWithAddress, minter: SignerWithAddress

	before(async () => {
		const signers = await ethers.getSigners()

		owner = signers[0]
		alice = signers[1]
		bob = signers[2]
		minter = signers[3]

		const Factory = await ethers.getContractFactory("WrappedPAC")
		const WPAC = await upgrades.deployProxy(Factory, undefined, { initializer: "initialize" })
		wpac = await WPAC.waitForDeployment()

		await wpac.setMinter(minter)
	})

	it("should grant Minter role correct", async () => {
		expect(await wpac.MINTER()).to.be.equal(minter)
	})

	it("only the Minter role can mint tokens", async () => {
		await expect(wpac.connect(alice).mint(bob.address, decimal(10))).to.be.revertedWith("WrappedPAC: caller is not the minter")
	})

	it("correct amount of tokens is minted to the specified address", async () => {
		await wpac.connect(minter).mint(alice.address, decimal(10))
		expect(await wpac.balanceOf(alice.address)).to.be.equal(decimal(10))
	})

	it("correct amount of tokens is minted to the specified address", async () => {
		await expect(wpac.connect(minter).mint(ethers.ZeroAddress, decimal(10))).to.be.revertedWith("ERC20: mint to the zero address")
	})
}
