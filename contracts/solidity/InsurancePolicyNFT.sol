// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "openzeppelin-contracts/contracts/token/ERC721/ERC721.sol";
import "openzeppelin-contracts/contracts/utils/ReentrancyGuard.sol";

/**
 * @title InsurancePolicyNFT (Revised with On-Chain Bookkeeping)
 * @dev Manages parametric insurance policies as NFTs.
 * It now includes an explicit mapping to easily discover all policies associated with a given asset.
 */
contract InsurancePolicyNFT is ERC721, ReentrancyGuard {
    enum PolicyType {
        Vessel,
        Cargo
    }
    enum TriggerCondition {
        None,
        ArrivalDelay,
        TemperatureFluctuation,
        WeatherDamage
    }

    struct InsurancePolicy {
        address policyHolder;
        PolicyType policyType;
        uint256 insuredTokenId; // The Vessel or Cargo NFT token ID being insured
        uint256 payoutAmount;
        uint256 premium;
        uint256 expiryTimestamp;
        TriggerCondition triggerCondition;
        bytes32 dataSource;
        int256 threshold;
        bool isActive;
    }

    mapping(uint256 => InsurancePolicy) public policies;

    // Quick lookup for brokerage contract (is an asset insured at all?)
    mapping(uint256 => mapping(uint256 => bool)) public isInsured;

    // NEW: The sophisticated bookkeeping/discovery mapping.
    // This allows anyone to find all policy NFTs for a given asset.
    // PolicyType => Asset Token ID => Array of Insurance Policy Token IDs
    mapping(uint256 => mapping(uint256 => uint256[])) public assetToPolicies;

    uint256 private _nextTokenId;
    address public oracle;

    event PolicyMinted(
        uint256 indexed policyTokenId,
        address indexed policyHolder,
        TriggerCondition triggerCondition,
        uint256 payoutAmount
    );
    event PayoutClaimed(uint256 indexed policyTokenId, uint256 amount);

    constructor() ERC721("ShipBrokerageInsurance", "SBI") {}

    function mintPolicy(
        PolicyType _policyType,
        uint256 _insuredTokenId,
        uint256 _payoutAmount,
        TriggerCondition _triggerCondition,
        bytes32 _dataSource,
        int256 _threshold,
        uint256 _expiryTimestamp
    ) public payable {
        uint256 premium = msg.value;
        require(premium > 0, "IPNFT: Premium must be paid");

        uint256 policyTokenId = _nextTokenId++;
        address policyHolder = msg.sender;
        _safeMint(policyHolder, policyTokenId);

        policies[policyTokenId] = InsurancePolicy({
            policyHolder: policyHolder,
            policyType: _policyType,
            insuredTokenId: _insuredTokenId,
            payoutAmount: _payoutAmount,
            premium: premium,
            expiryTimestamp: _expiryTimestamp,
            triggerCondition: _triggerCondition,
            dataSource: _dataSource,
            threshold: _threshold,
            isActive: true
        });

        // Update both bookkeeping mappings
        isInsured[uint256(_policyType)][_insuredTokenId] = true;

        // NEW: Add the new policy ID to the asset's list of policies.
        assetToPolicies[uint256(_policyType)][_insuredTokenId].push(
            policyTokenId
        );

        emit PolicyMinted(
            policyTokenId,
            policyHolder,
            _triggerCondition,
            _payoutAmount
        );
    }

    /**
     * @dev NEW: Public view function to get all insurance policies for a specific asset.
     * @param _policyType The type of asset (Vessel or Cargo).
     * @param _assetTokenId The token ID of the asset.
     * @return An array of InsurancePolicyNFT token IDs.
     */
    function getPoliciesForAsset(
        PolicyType _policyType,
        uint256 _assetTokenId
    ) public view returns (uint256[] memory) {
        return assetToPolicies[uint256(_policyType)][_assetTokenId];
    }

    // --- Unchanged Functions Below ---

    function checkInsurance(
        PolicyType _policyType,
        uint256 _tokenId
    ) public view returns (bool) {
        return isInsured[uint256(_policyType)][_tokenId];
    }

    modifier onlyOracle() {
        require(msg.sender == oracle, "IPNFT: Caller is not the oracle");
        _;
    }

    function claimPayout(uint256 policyTokenId) public {
        require(
            policies[policyTokenId].isActive,
            "IPNFT: Policy is not active"
        );
    }

    function fulfillPayout(
        uint256 policyTokenId,
        int256 value
    ) public nonReentrant /*onlyOracle*/ {
        InsurancePolicy storage policy = policies[policyTokenId];
        require(policy.isActive, "IPNFT: Policy is not active");
        require(
            block.timestamp <= policy.expiryTimestamp,
            "IPNFT: Policy expired"
        );

        bool triggerMet = false;
        if (policy.triggerCondition == TriggerCondition.ArrivalDelay) {
            if (value > policy.threshold) triggerMet = true;
        }

        if (triggerMet) {
            policy.isActive = false;
            (bool success, ) = policy.policyHolder.call{
                value: policy.payoutAmount
            }("");
            require(success, "IPNFT: Payout transfer failed");
            emit PayoutClaimed(policyTokenId, policy.payoutAmount);
        }
    }
}
