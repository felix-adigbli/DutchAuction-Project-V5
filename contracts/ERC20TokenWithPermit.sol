// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";

contract ERC20Token is ERC20, Ownable, ERC20Permit {
    constructor() ERC20("ERC20Token", "DUTERC20") ERC20Permit("ERC20Token") {}

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
}