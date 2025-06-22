// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./JourneyNFT.sol";
import "./InsurancePolicyNFT.sol";
import "./CargoNFT.sol";
import "./VesselNFT.sol";
import "openzeppelin-contracts/contracts/utils/ReentrancyGuard.sol";

/**
 * @title Brokerage (Revised)
 * @dev Main orchestrator contract that acts as a payment escrow and handles late-delivery penalties.
 */
contract Brokerage is ReentrancyGuard {
    VesselNFT public vesselNFT;
    CargoNFT public cargoNFT;
    JourneyNFT public journeyNFT;
    InsurancePolicyNFT public insurancePolicyNFT;

    enum ShipmentStatus {
        Proposed,
        Paid,
        InTransit,
        Completed,
        Cancelled
    }

    struct Shipment {
        uint256 shipmentId;
        uint256 journeyTokenId;
        uint256 cargoTokenId;
        address shipper;
        address vesselOwner;
        uint256 price; // Price in wei
        uint256 penaltyRate; // Penalty in wei per second of delay
        uint256 maxPenalty; // Maximum penalty amount in wei
        uint256 expectedDeliveryTimestamp;
        ShipmentStatus status;
    }

    mapping(uint256 => Shipment) public shipments;
    uint256 private _nextShipmentId;

    event ShipmentProposed(
        uint256 indexed shipmentId,
        uint256 cargoTokenId,
        uint256 journeyTokenId,
        uint256 price
    );
    event ShipmentPaid(uint256 indexed shipmentId);
    event ShipmentCompleted(
        uint256 indexed shipmentId,
        uint256 finalPayout,
        uint256 penalty
    );
    event ShipmentCancelled(uint256 indexed shipmentId);

    constructor(address _v, address _c, address _j, address _i) {
        vesselNFT = VesselNFT(_v);
        cargoNFT = CargoNFT(_c);
        journeyNFT = JourneyNFT(_j);
        insurancePolicyNFT = InsurancePolicyNFT(_i);
    }

    function proposeShipment(
        uint256 _journeyTokenId,
        uint256 _cargoTokenId,
        uint256 _price,
        uint256 _penaltyRate, // e.g., wei per second
        uint256 _maxPenaltyPercentage // e.g., 20 for 20%
    ) public {
        require(
            cargoNFT.ownerOf(_cargoTokenId) == msg.sender,
            "BROKERAGE: Not cargo owner"
        );
        JourneyNFT.Journey memory journey = journeyNFT.getJourneyDetails(
            _journeyTokenId
        );
        CargoNFT.CargoDetails memory cargo = cargoNFT.getCargoDetails(
            _cargoTokenId
        );
        require(journey.isListed, "BROKERAGE: Journey not listed");
        require(
            cargo.weight <= journey.availableCapacity,
            "BROKERAGE: Insufficient capacity"
        );
        require(
            _maxPenaltyPercentage <= 100,
            "BROKERAGE: Max penalty cannot exceed 100%"
        );

        uint256 shipmentId = _nextShipmentId++;
        shipments[shipmentId] = Shipment({
            shipmentId: shipmentId,
            journeyTokenId: _journeyTokenId,
            cargoTokenId: _cargoTokenId,
            shipper: msg.sender,
            vesselOwner: journey.vesselOwner,
            price: _price,
            penaltyRate: _penaltyRate,
            maxPenalty: (_price * _maxPenaltyPercentage) / 100,
            expectedDeliveryTimestamp: journey.expectedArrivalTimestamp,
            status: ShipmentStatus.Proposed
        });
        emit ShipmentProposed(
            shipmentId,
            _cargoTokenId,
            _journeyTokenId,
            _price
        );
    }

    function acceptAndPayForShipment(
        uint256 _shipmentId
    ) public payable nonReentrant {
        Shipment storage shipment = shipments[_shipmentId];
        require(
            shipment.vesselOwner == msg.sender,
            "BROKERAGE: Not vessel owner"
        );
        require(
            shipment.status == ShipmentStatus.Proposed,
            "BROKERAGE: Not proposed"
        );
        require(
            msg.value == shipment.price,
            "BROKERAGE: Incorrect payment amount"
        );

        // Shipper must approve Brokerage to manage both NFTs first
        cargoNFT.transferFrom(
            shipment.shipper,
            address(this),
            shipment.cargoTokenId
        );

        CargoNFT.CargoDetails memory cargo = cargoNFT.getCargoDetails(
            shipment.cargoTokenId
        );
        journeyNFT.decreaseJourneyCapacity(
            shipment.journeyTokenId,
            cargo.weight
        );

        shipment.status = ShipmentStatus.Paid;
        emit ShipmentPaid(_shipmentId);
    }

    function completeShipment(uint256 _shipmentId) public nonReentrant {
        Shipment storage shipment = shipments[_shipmentId];
        require(
            shipment.vesselOwner == msg.sender,
            "BROKERAGE: Not vessel owner"
        );
        require(
            shipment.status == ShipmentStatus.Paid ||
                shipment.status == ShipmentStatus.InTransit,
            "BROKERAGE: Not in progress"
        );

        uint256 penalty = 0;
        if (block.timestamp > shipment.expectedDeliveryTimestamp) {
            uint256 delayInSeconds = block.timestamp -
                shipment.expectedDeliveryTimestamp;
            penalty = delayInSeconds * shipment.penaltyRate;
            if (penalty > shipment.maxPenalty) {
                penalty = shipment.maxPenalty;
            }
        }

        uint256 finalPayout = shipment.price - penalty;
        shipment.status = ShipmentStatus.Completed;

        // Release CargoNFT back to the original shipper
        cargoNFT.transferFrom(
            address(this),
            shipment.shipper,
            shipment.cargoTokenId
        );

        // Pay the vessel owner
        (bool success, ) = shipment.vesselOwner.call{value: finalPayout}("");
        require(success, "BROKERAGE: Payment failed");

        emit ShipmentCompleted(_shipmentId, finalPayout, penalty);
    }

    function cancelShipment(uint256 _shipmentId) public nonReentrant {
        Shipment storage shipment = shipments[_shipmentId];
        require(
            shipment.shipper == msg.sender,
            "BROKERAGE: Only shipper can cancel"
        );
        require(
            shipment.status == ShipmentStatus.Proposed ||
                shipment.status == ShipmentStatus.Paid,
            "BROKERAGE: Cannot cancel now"
        );

        if (shipment.status == ShipmentStatus.Paid) {
            // Return CargoNFT to shipper
            cargoNFT.transferFrom(
                address(this),
                shipment.shipper,
                shipment.cargoTokenId
            );
            // Refund the shipper
            (bool success, ) = shipment.shipper.call{value: shipment.price}("");
            require(success, "BROKERAGE: Refund failed");
        }
        shipment.status = ShipmentStatus.Cancelled;
        emit ShipmentCancelled(_shipmentId);
    }
}
