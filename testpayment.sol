// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract testpayment
{
    struct Data
    {
        uint256 id;
        string product_name;
    }

    mapping (uint256 => Data) public data;
    address public owner;

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Unauthorized: Only owner can call this function");
        _;
    }


    function addData(uint256 p_id, string memory p_name) public 
    {
        data[p_id] = Data(p_id, p_name);
    }

    function getData(uint256 p_id) external view returns (uint256 , string memory)
    {
        return (data[p_id].id, data[p_id].product_name);
    }
}