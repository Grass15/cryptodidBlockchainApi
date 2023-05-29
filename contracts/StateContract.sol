// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

contract StateContract {
    string public state;

    function setState(string memory newState) public {
        state = newState;
    }
}
