// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "openzeppelin-contracts/contracts/token/ERC721/ERC721.sol";

/**
 * @title CargoNFT (Revised)
 * @dev Represents cargo loads as NFTs with expanded metadata.
 */
contract CargoNFT is ERC721 {
    struct CargoDetails {
        string description;
        string cargoType; // e.g., 'container', 'dry_bulk'
        uint256 weight; // Weight in tons
        uint256 volumeCBM; // Volume in cubic meters
        string originPort;
        string destinationPort;
    }

    uint256 private _nextTokenId;
    mapping(uint256 => CargoDetails) public cargoDetails;

    event CargoMinted(
        uint256 indexed tokenId,
        address indexed shipper,
        uint256 weight
    );

    constructor() ERC721("ShipBrokerageCargo", "SBC") {}

    function mintCargo(
        address shipper,
        string calldata description,
        string calldata cargoType,
        uint256 weight,
        uint256 volumeCBM,
        string calldata originPort,
        string calldata destinationPort
    ) public {
        // Note: Add access control in production
        uint256 tokenId = _nextTokenId++;
        _safeMint(shipper, tokenId);

        cargoDetails[tokenId] = CargoDetails({
            description: description,
            cargoType: cargoType,
            weight: weight,
            volumeCBM: volumeCBM,
            originPort: originPort,
            destinationPort: destinationPort
        });

        emit CargoMinted(tokenId, shipper, weight);
    }

    function getCargoDetails(
        uint256 tokenId
    ) public view returns (CargoDetails memory) {
        return cargoDetails[tokenId];
    }
}
