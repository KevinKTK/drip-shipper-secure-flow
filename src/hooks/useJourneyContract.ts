import { useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { contractAddresses } from '@/lib/contract-addresses';
import { polygonZkEvmCardona } from 'wagmi/chains';

// Journey NFT ABI - CORRECTED to match the Solidity contract
const JOURNEY_NFT_ABI = [
  {
    // The 'mintJourney' function in the contract
    name: "mintJourney",
    type: "function",
    stateMutability: "nonpayable",
    // CORRECTED: The inputs now match the Solidity function signature
    inputs: [
      { name: "_vesselTokenId", type: "uint256" },
      { name: "_originPort", type: "string" },
      { name: "_destinationPort", type: "string" },
      { name: "_departureTimestamp", type: "uint256" },
      { name: "_expectedArrivalTimestamp", type: "uint256" },
      { name: "_availableCapacity", type: "uint256" } // Added this required parameter
    ],
    // CORRECTED: The function does not have a return value
    outputs: [],
  }
] as const;

export const useJourneyContract = () => {
  const { address } = useAccount();
  const { writeContract, data: hash, isPending, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  // CORRECTED: The parameters object now matches the contract's requirements
  const mintJourney = async (params: {
    vesselTokenId: string;
    originPort: string;
    destinationPort: string;
    departureTimestamp: number;
    expectedArrivalTimestamp: number;
    availableCapacity: string; // Added this required parameter
  }) => {
    try {
      console.log('Minting Journey NFT with params:', {
        vesselTokenId: params.vesselTokenId,
        originPort: params.originPort,
        destinationPort: params.destinationPort,
        departureTimestamp: params.departureTimestamp,
        expectedArrivalTimestamp: params.expectedArrivalTimestamp,
        availableCapacity: params.availableCapacity, // Added for logging
        contractAddress: contractAddresses.journeyNFT
      });

      // CORRECTED: Updated validation logic
      if (!params.vesselTokenId || !params.originPort || !params.destinationPort || !params.availableCapacity) {
        throw new Error('Missing required parameters for Journey NFT minting');
      }

      if (params.departureTimestamp <= 0 || params.expectedArrivalTimestamp <= 0) {
        throw new Error('Invalid timestamp values');
      }

      if (params.expectedArrivalTimestamp <= params.departureTimestamp) {
        throw new Error('Expected arrival must be after departure');
      }

      // The `writeContract` function will trigger a wallet confirmation
      await writeContract({
        address: contractAddresses.journeyNFT as `0x${string}`,
        abi: JOURNEY_NFT_ABI,
        functionName: 'mintJourney',
        // CORRECTED: The arguments array now matches the ABI
        args: [
          BigInt(params.vesselTokenId),
          params.originPort,
          params.destinationPort,
          BigInt(params.departureTimestamp),
          BigInt(params.expectedArrivalTimestamp),
          BigInt(params.availableCapacity) // Added new argument
        ],
        chain: polygonZkEvmCardona,
        account: address, // The connected user's account, must be the vessel owner
        gas: BigInt(500000), // A reasonable gas limit, adjust if needed
      });
    } catch (error) {
      console.error('Error minting journey NFT:', error);
      throw error; // Re-throw the error to be caught by the calling component
    }
  };

  return {
    mintJourney,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  };
};