// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity >=0.8.20;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";
/**
 * @title WrappedPAC (WPAC)
 *
 * @custom:developer dezh technologies <hi@dezh.tech>
 * @custom:contact https://dezh.tech
 * @custom:version 0.0.2
 * @custom:license MIT
 */
contract WrappedPAC is Initializable, OwnableUpgradeable, PausableUpgradeable, ERC20Upgradeable, UUPSUpgradeable {
	// Struct to store details of a bridge event
	struct BridgeEvent {
		address sender; // Address of the sender
		uint256 amount; // Amount of WPAC tokens bridged
		string destinationAddress; // Destination address on the target chain
		uint256 fee; // Fee charged for the bridge
	}

	// Constants for fee calculation
	uint256 public constant MIN_FEE = 1_000_000_000; // 1 WPAC
	uint256 public constant MAX_FEE = 5_000_000_000; // 5 WPAC

	// Mapping to store bridge events by a unique identifier (counter)
	mapping(uint256 => BridgeEvent) public bridged;

	// Counter for tracking bridge events
	uint256 public counter;

	address public MINTER;
	address public FEE_COLLECTOR;

	// Events
	event Bridge(address indexed sender, uint256 amount, string destinationAddress, uint256 fee);
	event SetMinter(address indexed minter);
	event SetFeeCollector(address indexed feeCollector);

	modifier OnlyMinter(address caller) {
		require(caller == MINTER, "WrappedPAC: caller is not the minter");
		_;
	}

	modifier OnlyFeeCollector(address caller) {
		require(caller == FEE_COLLECTOR, "WrappedPAC: caller is not the fee collector");
		_;
	}

	/// @custom:oz-upgrades-unsafe-allow constructor
	constructor() {
		_disableInitializers();
	}

	/**
	 * @notice Initializes the contract.
	 * @dev Sets the token name and symbol, initializes the ownership, and enables UUPS upgradeability.
	 */
	function initialize() public initializer {
		__ERC20_init("Wrapped PAC", "WPAC");
		__Ownable_init();
		__UUPSUpgradeable_init();
	}

	/**
	 * @notice Returns the number of decimals used by the token.
	 * @return The number of decimals (9).
	 */
	function decimals() public pure override returns (uint8) {
		return 9;
	}

	/**
	 * @notice Mints new tokens to a specified address.
	 * @dev Requires the caller to have the MINTER_ROLE.
	 * @param to The address to receive the minted tokens.
	 * @param amount The amount of tokens to mint.
	 */
	function mint(address to, uint256 amount) public OnlyMinter(_msgSender()) {
		_mint(to, amount);
	}

	/**
	 * @notice Calculates the bridge fee for a given amount.
	 * @param amount The amount to bridge.
	 * @return The calculated fee, constrained by MIN_FEE and MAX_FEE.
	 */
	function getFee(uint256 amount) public pure returns (uint256) {
		uint256 f = Math.ceilDiv(amount, 200); // 0.5%

		if (f <= MIN_FEE) {
			return MIN_FEE;
		}

		if (f >= MAX_FEE) {
			return MAX_FEE;
		}

		return f;
	}

	/**
	 * @notice Bridges tokens to another chain.
	 * @dev Burns the sender's tokens and records the bridge event.
	 * @param destinationAddress The address on the destination chain.
	 * @param value The amount of tokens to bridge.
	 */
	function bridge(string memory destinationAddress, uint256 value) public whenNotPaused {
		require(value > (1 * 1e9), "WrappedPAC: value is low.");

		uint256 fee = getFee(value);
		_transfer(_msgSender(), address(this), fee); // Transfer fee to the contract

		_burn(_msgSender(), value); // Burn the tokens

		emit Bridge(_msgSender(), value, destinationAddress, fee);
		counter++;
		bridged[counter] = BridgeEvent(_msgSender(), value, destinationAddress, fee);
	}

	/**
	 * @notice Bridges tokens administratively without charging a fee.
	 * @dev Only callable by accounts with the FEE_COLLECTOR_ROLE.
	 * @param destinationAddress The address on the destination chain.
	 * @param value The amount of tokens to bridge.
	 */
	function adminBridge(string memory destinationAddress, uint256 value) public whenNotPaused OnlyFeeCollector(_msgSender()) {
		_burn(_msgSender(), value);
		emit Bridge(_msgSender(), value, destinationAddress, 0);
		counter++;
		bridged[counter] = BridgeEvent(_msgSender(), value, destinationAddress, 0);
	}

	/**
	 * @notice Withdraws all accumulated fees from the contract.
	 * @dev Only callable by accounts with the FEE_COLLECTOR_ROLE.
	 */
	function withdrawFee() public OnlyFeeCollector(_msgSender()) {
		_transfer(address(this), _msgSender(), balanceOf(address(this)));
	}

	/**
	 * @notice Sets the FEE_COLLECTOR_ROLE for a given address.
	 * @dev Only callable by the contract owner. Grants the FEE_COLLECTOR_ROLE to the specified address.
	 * @param _feeCollectorAddress The address to grant the FEE_COLLECTOR_ROLE.
	 */
	function setFeeCollector(address _feeCollectorAddress) public onlyOwner {
		FEE_COLLECTOR = _feeCollectorAddress;
		emit SetFeeCollector(_feeCollectorAddress);
	}

	/**
	 * @notice Sets the MINTER_ROLE for a given address.
	 * @dev Only callable by the contract owner. Grants the MINTER_ROLE to the specified address.
	 * @param _minterAddress The address to grant the MINTER_ROLE.
	 */
	function setMinter(address _minterAddress) public onlyOwner {
		MINTER = _minterAddress;
		emit SetMinter(_minterAddress);
	}

	/**
	 * @notice Authorizes an upgrade to a new implementation.
	 * @dev Only callable by the contract owner.
	 * @param newImplementation The address of the new implementation.
	 */
	function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}
}
