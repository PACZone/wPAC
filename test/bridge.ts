import { ethers, upgrades } from "hardhat"
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers"
import { expect } from "chai"
import { decimal } from "../utils/decimal"
import { getFee } from "./utils/fee"
import { WrappedPAC } from "../src/types"

export const shouldBehaveLikeBridge = async () => {
	let wpac: WrappedPAC
	let owner: SignerWithAddress, alice: SignerWithAddress, bob: SignerWithAddress, minter: SignerWithAddress
	const pacAddr = "tpc1zlymfcuxlgvvuud2q4zw0scllqn74d2f90hld6w"

	before(async () => {
		const signers = await ethers.getSigners()

		owner = signers[0]
		alice = signers[1]
		bob = signers[2]
		minter = signers[3]
	})

	beforeEach(async () => {
		const Factory = await ethers.getContractFactory("WrappedPAC")
		const WPAC = await upgrades.deployProxy(Factory, undefined, { initializer: "initialize" })
		wpac = await WPAC.waitForDeployment()
		
		await wpac.setMinter(minter)

		await wpac.connect(minter).mint(bob.address, decimal(100))

	})

	it("should fails if the value is below the minimum threshold", async () => {
		await expect(wpac.connect(bob).bridge(pacAddr, decimal(1))).to.be.revertedWith("WrappedPAC: value is low.")
	})

	it("should fails if amount exceeds balance", async () => {
		await expect(wpac.connect(bob).bridge(pacAddr, decimal(110))).to.be.revertedWith("ERC20: burn amount exceeds balance")
		await expect(wpac.connect(bob).bridge(pacAddr, decimal(101))).to.be.revertedWith("ERC20: burn amount exceeds balance")
		await expect(wpac.connect(bob).bridge(pacAddr, decimal(100))).to.be.revertedWith("ERC20: burn amount exceeds balance")
	})

	it("should bridging tokens to another blockchain address", async () => {
		await wpac.connect(bob).bridge(pacAddr, decimal(7))

		const b = await wpac.bridged(1)

		expect(await wpac.balanceOf(bob.address)).to.be.equal(decimal(92))
		expect(b.destinationAddress).to.be.equal(pacAddr)
		expect(b.sender).to.be.equal(bob.address)
		expect(b.amount).to.be.equal(decimal(7))
		expect(b.fee).to.be.equal(getFee(7))

		expect(await wpac.balanceOf(wpac.target)).to.be.equal(getFee(7)) //Fee
		expect(await wpac.totalSupply()).to.be.equal(decimal(93)) //burn
		expect(await wpac.counter()).to.be.equal(1) //counter
	})
}
