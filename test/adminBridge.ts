import { ethers, upgrades } from "hardhat"
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers"
import { expect } from "chai"
import { decimal } from "../utils/decimal"
import { WrappedPAC } from "../src/types"

export const shouldBehaveLikeAdminBridge = async () => {
	let wpac: WrappedPAC
	let owner: SignerWithAddress, alice: SignerWithAddress, bob: SignerWithAddress, minter: SignerWithAddress, feeCollector: SignerWithAddress
	const pacAddr = "tpc1zlymfcuxlgvvuud2q4zw0scllqn74d2f90hld6w"

	before(async () => {
		const signers = await ethers.getSigners()

		owner = signers[0]
		alice = signers[1]
		bob = signers[2]
		minter = signers[3]
		feeCollector = signers[4]
	})

	beforeEach(async () => {
		const Factory = await ethers.getContractFactory("WrappedPAC")
		const WPAC = await upgrades.deployProxy(Factory, undefined, { initializer: "initialize" })
		wpac = await WPAC.waitForDeployment()

		await wpac.setMinter(minter)
		await wpac.setFeeCollector(feeCollector)

		await wpac.connect(minter).mint(bob.address, decimal(100))
	})

	it("should grant Fee collector correct", async () => {
		expect(await wpac.FEE_COLLECTOR()).to.be.equal(feeCollector)
	})

	it("should fails if caller is not fee collector", async () => {
		await expect(wpac.connect(alice).adminBridge(pacAddr, decimal(1))).to.be.revertedWith("WrappedPAC: caller is not the fee collector")
	})

	it("should fails if amount exceeds balance", async () => {
		await expect(wpac.connect(feeCollector).adminBridge(pacAddr, decimal(1))).to.be.revertedWith("ERC20: burn amount exceeds balance")

		await wpac.connect(bob).bridge(pacAddr, decimal(8))
		await wpac.connect(feeCollector).withdrawFee()

		await expect(wpac.connect(feeCollector).adminBridge(pacAddr, decimal(2))).to.be.revertedWith("ERC20: burn amount exceeds balance")
	})

	it("should bridging tokens to another blockchain address(FeeCollector)", async () => {
		await wpac.connect(bob).bridge(pacAddr, decimal(8))
		await wpac.connect(bob).bridge(pacAddr, decimal(10))
		await wpac.connect(feeCollector).withdrawFee()

		await wpac.connect(feeCollector).adminBridge(pacAddr, decimal(2))

		const b = await wpac.bridged(3)

		expect(await wpac.balanceOf(feeCollector.address)).to.be.equal(0)
		expect(b.destinationAddress).to.be.equal(pacAddr)
		expect(b.sender).to.be.equal(feeCollector.address)
		expect(b.amount).to.be.equal(decimal(2))
		expect(b.fee).to.be.equal(decimal(0))

		expect(await wpac.balanceOf(wpac.target)).to.be.equal(0) //Fee
		expect(await wpac.totalSupply()).to.be.equal(decimal(80)) //burn
		expect(await wpac.counter()).to.be.equal(3) //counter
	})
}
