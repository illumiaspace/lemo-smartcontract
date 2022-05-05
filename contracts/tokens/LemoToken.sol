// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract LemoToken is ERC20 {
    constructor()
    ERC20("Let's move", "LEMO")
    {}

    function mint(uint256 _amount, address _issuer) external {
        _mint(_issuer, _amount);
    }

    function burn(uint256 _amount, address _from) external {
        _burn(_from, _amount);
    }
}