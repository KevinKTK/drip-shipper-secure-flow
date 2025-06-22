// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "openzeppelin-contracts/contracts/token/ERC721/ERC721.sol";
import "./VesselNFT.sol";

/**
 * @title JourneyNFT (Revised with Bookkeeping and Dynamic Route)
 * @dev Manages journey listings as NFTs with dynamic routes and bookkeeping for vessel journeys.
 */
contract JourneyNFT is ERC721 {
    // --- Structs ---

    struct Journey {
        uint256 vesselTokenId;
        address vesselOwner;
        string originPort;
        string destinationPort;
        uint256 departureTimestamp;
        uint256 expectedArrivalTimestamp;
        uint256 availableCapacity;
        bool isListed;
    }

    struct RouteStop {
        string location;
        uint256 arrivalTimestamp;
    }

    // --- State Variables ---

    VesselNFT public vesselNFT;
    mapping(uint256 => Journey) public journeys;
    mapping(uint256 => RouteStop[]) public journeyRoute;

    // NEW: The bookkeeping/discovery mapping.
    // This allows anyone to find all journey NFTs for a given vessel.
    // Vessel Token ID => Array of Journey Token IDs
    mapping(uint256 => uint256[]) public vesselToJourneys;

    uint256 private _nextTokenId;

    // --- Events ---

    event JourneyMinted(
        uint256 indexed journeyTokenId,
        uint256 indexed vesselTokenId,
        address indexed vesselOwner
    );
    event StopAddedToRoute(
        uint256 indexed journeyTokenId,
        uint256 newStopIndex,
        string location
    );
    event ArrivedAtStop(
        uint256 indexed journeyTokenId,
        uint256 stopIndex,
        string location,
        uint256 arrivalTimestamp
    );

    constructor(
        address _vesselNFTAddress
    ) ERC721("ShipBrokerageJourney", "SBJ") {
        vesselNFT = VesselNFT(_vesselNFTAddress);
    }

    // --- Core Functions ---

    function mintJourney(
        uint256 _vesselTokenId,
        string calldata _originPort,
        string calldata _destinationPort,
        uint256 _departureTimestamp,
        uint256 _expectedArrivalTimestamp,
        uint256 _availableCapacity
    ) public {
        address vesselOwner = vesselNFT.ownerOf(_vesselTokenId);
        require(vesselOwner == msg.sender, "JNFT: Not the vessel owner");
        require(
            _expectedArrivalTimestamp > _departureTimestamp,
            "JNFT: Arrival must be after departure"
        );

        uint256 journeyTokenId = _nextTokenId++;
        _safeMint(vesselOwner, journeyTokenId);

        journeys[journeyTokenId] = Journey({
            vesselTokenId: _vesselTokenId,
            vesselOwner: vesselOwner,
            originPort: _originPort,
            destinationPort: _destinationPort,
            departureTimestamp: _departureTimestamp,
            expectedArrivalTimestamp: _expectedArrivalTimestamp,
            availableCapacity: _availableCapacity,
            isListed: true
        });

        // NEW: Add the new journey ID to the vessel's list of journeys.
        vesselToJourneys[_vesselTokenId].push(journeyTokenId);

        emit JourneyMinted(journeyTokenId, _vesselTokenId, vesselOwner);
    }

    function addStopToRoute(
        uint256 _journeyTokenId,
        string calldata _location
    ) public {
        require(
            ownerOf(_journeyTokenId) == msg.sender,
            "JNFT: Not the journey owner"
        );
        RouteStop[] storage route = journeyRoute[_journeyTokenId];
        uint256 newStopIndex = route.length;
        route.push(RouteStop({location: _location, arrivalTimestamp: 0}));
        emit StopAddedToRoute(_journeyTokenId, newStopIndex, _location);
    }

    function arriveAtStop(uint256 _journeyTokenId, uint256 _stopIndex) public {
        require(
            ownerOf(_journeyTokenId) == msg.sender,
            "JNFT: Not the journey owner"
        );
        RouteStop storage stop = journeyRoute[_journeyTokenId][_stopIndex];
        require(bytes(stop.location).length > 0, "JNFT: Stop does not exist");
        require(stop.arrivalTimestamp == 0, "JNFT: Arrival already logged");
        stop.arrivalTimestamp = block.timestamp;
        emit ArrivedAtStop(
            _journeyTokenId,
            _stopIndex,
            stop.location,
            stop.arrivalTimestamp
        );
    }

    function decreaseJourneyCapacity(
        uint256 _journeyTokenId,
        uint256 _cargoWeight
    ) public {
        Journey storage journey = journeys[_journeyTokenId];
        require(journey.isListed, "JNFT: Journey does not exist");
        require(
            journey.availableCapacity >= _cargoWeight,
            "JNFT: Insufficient capacity"
        );
        journey.availableCapacity -= _cargoWeight;
    }

    // --- View Functions ---

    /**
     * @dev NEW: Public view function to get all journeys for a specific vessel.
     * @param _vesselTokenId The token ID of the vessel.
     * @return An array of JourneyNFT token IDs.
     */
    function getJourneysForVessel(
        uint256 _vesselTokenId
    ) public view returns (uint256[] memory) {
        return vesselToJourneys[_vesselTokenId];
    }

    function getJourneyDetails(
        uint256 _journeyTokenId
    ) public view returns (Journey memory) {
        require(
            journeys[_journeyTokenId].isListed,
            "JNFT: Journey does not exist"
        );
        return journeys[_journeyTokenId];
    }

    function getJourneyRoute(
        uint256 _journeyTokenId
    ) public view returns (RouteStop[] memory) {
        return journeyRoute[_journeyTokenId];
    }
}
