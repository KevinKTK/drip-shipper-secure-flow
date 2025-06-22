// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "openzeppelin-contracts/contracts/token/ERC721/ERC721.sol";

/**
 * @title VesselNFT (Revised)
 * @dev Represents unique vessels as NFTs with expanded metadata.
 */
contract VesselNFT is ERC721 {
    struct VesselDetails {
        string name;
        string imoNumber; // International Maritime Organization number
        string vesselType; // e.g., 'container_ship', 'bulk_carrier'
        uint256 capacityDWT; // Deadweight tonnage
    }

    uint256 private _nextTokenId;
    mapping(uint256 => VesselDetails) public vesselDetails;

    event VesselMinted(
        uint256 indexed tokenId,
        address indexed owner,
        string name,
        uint256 capacityDWT
    );

    constructor() ERC721("ShipBrokerageVessel", "SBV") {}

    function mintVessel(
        address owner,
        string calldata name,
        string calldata imoNumber,
        string calldata vesselType,
        uint256 capacityDWT
    ) public {
        // Note: Add access control in production
        uint256 tokenId = _nextTokenId++;
        _safeMint(owner, tokenId);

        vesselDetails[tokenId] = VesselDetails({
            name: name,
            imoNumber: imoNumber,
            vesselType: vesselType,
            capacityDWT: capacityDWT
        });

        emit VesselMinted(tokenId, owner, name, capacityDWT);
    }
}
