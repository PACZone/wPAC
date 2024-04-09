// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity >=0.8.20;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";

contract WrappedPAC is Initializable, OwnableUpgradeable, PausableUpgradeable, ERC20Upgradeable, UUPSUpgradeable {
	struct BridgeEvent {
		address sender;
		uint256 amount;
		string destinationAddress;
		uint256 fee;
	}
	uint256 public constant MIN_FEE = 1_000_000_000; // 1wpac
	uint256 public constant MAX_FEE = 5_000_000_000; // 5wpac
	mapping(uint256 => BridgeEvent) public bridged;
	uint256 public counter;
	event Bridge(address indexed sender, uint256 amount, string destinationAddress, uint256 fee);

	/// @custom:oz-upgrades-unsafe-allow constructor
	constructor() {
		_disableInitializers();
	}

	function initialize() public initializer {
		__ERC20_init("Wrapped PAC", "WPAC");
		__Ownable_init();
		__UUPSUpgradeable_init();
	}

	function decimals() public pure override returns (uint8) {
		return 9;
	}

	function mint(address to, uint256 amount) public onlyOwner {
		_mint(to, amount);
	}

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

	function bridge(string memory destinationAddress, uint256 value) public whenNotPaused {
		require(value > (1 * 1e9), "Bridge: value is low.");

		_transfer(_msgSender(), address(this), getFee(value)); //fee

		_burn(_msgSender(), value);

		emit Bridge(_msgSender(), value, destinationAddress, getFee(value));
		counter++;
		bridged[counter] = BridgeEvent(_msgSender(), value , destinationAddress, getFee(value));
	}

	function adminBridge(string memory destinationAddress, uint256 value) public whenNotPaused onlyOwner {
		_burn(_msgSender(), value);
		emit Bridge(_msgSender(), value, destinationAddress, 0);
		counter++;
		bridged[counter] = BridgeEvent(_msgSender(), value, destinationAddress, 0);
	}

	function withdrawFee() public onlyOwner {
		_transfer(address(this), _msgSender(), balanceOf(address(this)));
	}

	function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}
}
