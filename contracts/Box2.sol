// contracts/Box2.sol
pragma solidity ^0.5.0;

import "@openzeppelin/upgrades/contracts/Initializable.sol";


contract Box2 is Initializable {
    uint256 private value;

    // Emitted when the stored value changes
    event ValueChanged(uint256 newValue);

    function initialize(uint256 initValue) public initializer {
        value = initValue;
    }

    // Stores a new value in the contract
    function store(uint256 newValue) public {
        value = newValue;
        emit ValueChanged(newValue);
    }

    // Reads the last stored value
    function retrieve() public view returns (uint256) {
        return value * 2;
    }
}
