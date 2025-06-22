// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";

// Import all the contract artifacts you need to deploy
import {VesselNFT} from "../src/VesselNFT.sol";
import {CargoNFT} from "../src/CargoNFT.sol";
import {JourneyNFT} from "../src/JourneyNFT.sol";
import {InsurancePolicyNFT} from "../src/InsurancePolicyNFT.sol";
import {Brokerage} from "../src/Brokerage.sol";

/**
 * @title DeployBrokerage
 * @author Your Name
 * @notice This script deploys the entire Ship Brokerage platform.
 *
 * To run this script, use the following command:
 * forge script script/DeployBrokerage.s.sol:DeployBrokerage --rpc-url <your_rpc_url> --private-key <your_private_key> --broadcast -vvvv
 */
contract DeployBrokerage is Script {
    function run() public {
        // Retrieve the private key from your environment or a secure vault
        uint256 deployerPrivateKey = vm.envUint("WALLET_PRIVATE_KEY");

        // Start broadcasting transactions from the deployer's wallet
        vm.startBroadcast(deployerPrivateKey);

        console.log("Deploying VesselNFT...");
        VesselNFT vesselNFT = new VesselNFT();
        console.log("VesselNFT deployed at:", address(vesselNFT));

        console.log("Deploying CargoNFT...");
        CargoNFT cargoNFT = new CargoNFT();
        console.log("CargoNFT deployed at:", address(cargoNFT));

        // Deploy JourneyNFT, passing the address of the VesselNFT contract
        console.log("Deploying JourneyNFT...");
        JourneyNFT journeyNFT = new JourneyNFT(address(vesselNFT));
        console.log("JourneyNFT deployed at:", address(journeyNFT));

        // Deploy InsurancePolicyNFT (it has no constructor dependencies on other contracts)
        console.log("Deploying InsurancePolicyNFT...");
        InsurancePolicyNFT insurancePolicyNFT = new InsurancePolicyNFT();
        console.log(
            "InsurancePolicyNFT deployed at:",
            address(insurancePolicyNFT)
        );

        // Deploy the main Brokerage contract with all its dependencies
        console.log("Deploying Brokerage...");
        Brokerage brokerage = new Brokerage(
            address(vesselNFT),
            address(cargoNFT),
            address(journeyNFT),
            address(insurancePolicyNFT)
        );
        console.log("Brokerage contract deployed at:", address(brokerage));

        // Stop broadcasting
        vm.stopBroadcast();
    }
}
