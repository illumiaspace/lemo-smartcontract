// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract LemoToken is ERC20, Ownable {
    constructor()
    ERC20("Let's move", "LEMO")
    {
        _mint(msg.sender, 1000000000 ether);
    }
}