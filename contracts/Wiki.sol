// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract Wiki {
    // Create struct for a page
    struct Page {
        uint id;
        string name;
        string ipfshash;
    }

    mapping(uint => Page) public pages;

    // Store pages Count
    uint public pagesCount = 0;

    // Page added event
    event pageEvent ();

    function addPage (string memory name, string memory ipfshash) public {
        for (uint i = 0; i < pagesCount; i++) {
            if (keccak256(abi.encodePacked(pages[i].name)) == keccak256(abi.encodePacked(name))) {
                return;
            }
        }
        pages[pagesCount] = Page(pagesCount, name, ipfshash);
        pagesCount ++;

        emit pageEvent();
    }
}