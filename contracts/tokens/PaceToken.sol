// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract PaceToken is ERC20, Ownable {
    constructor()
    ERC20("Pace", "PACE")
    {
        _mint(msg.sender, 1000000000 ether);
    }

    function mint(uint256 _amount, address _issuer) public onlyOwner {
        _mint(_issuer, _amount);
    }

    function burn(uint256 _amount, address _from) public onlyOwner {
        _burn(_from, _amount);
    }
}