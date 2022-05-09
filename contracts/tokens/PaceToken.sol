// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract PaceToken is ERC20 {
    constructor()
    ERC20("Pace", "PACE")
    {}

    function mint(uint256 _amount, address _issuer) public onlyOwner {
        _mint(_issuer, _amount);
    }

    function burn(uint256 _amount, address _from) public onlyOwner {
        _burn(_from, _amount);
    }
}