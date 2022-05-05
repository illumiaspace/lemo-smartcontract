// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../libraries/LibDiamond.sol";
import "hardhat/console.sol";

contract CallProtection {
    modifier protectedCall() {
//        console.logAddress(LibDiamond.diamondStorage().contractOwner);
        console.log(LibDiamond.diamondStorage().facetAddresses.length);
        for (uint i=0; i < LibDiamond.diamondStorage().facetAddresses.length; i++) {
            console.log(LibDiamond.diamondStorage().facetAddresses[i]);
        }
//        console.log(address(this));
        require(
            msg.sender == LibDiamond.diamondStorage().contractOwner ||
            msg.sender == address(this), "NOT_ALLOWED"
        );
        _;
    }
}
