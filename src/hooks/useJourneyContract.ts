
import { useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { contractAddresses } from '@/lib/contract-addresses';
import { polygonZkEvmCardona } from 'wagmi/chains';

// Journey NFT ABI - updated to match the actual contract signature
const JOURNEY_NFT_ABI = [
  {
    inputs: [
      { name: "_to", type: "address" },
      { name: "_vesselTokenId", type: "uint256" },
      { name: "_originPort", type: "string" },
      { name: "_destinationPort", type: "string" },
      { name: "_departureTimestamp", type: "uint256" },
      { name: "_expectedArrivalTimestamp", type: "uint256" }
    ],
    name: "mintJourney",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function"
  }
] as const;

export const useJourneyContract = () => {
  const { address } = useAccount();
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const mintJourney = async (params: {
    to: string;
    vesselTokenId: string;
    originPort: string;
    destinationPort: string;
    departureTimestamp: number;
    expectedArrivalTimestamp: number;
  }) => {
    try {
      await writeContract({
        address: contractAddresses.journeyNFT as `0x${string}`,
        abi: JOURNEY_NFT_ABI,
        functionName: 'mintJourney',
        args: [
          params.to as `0x${string}`,
          BigInt(params.vesselTokenId),
          params.originPort,
          params.destinationPort,
          BigInt(params.departureTimestamp),
          BigInt(params.expectedArrivalTimestamp)
        ],
        chain: polygonZkEvmCardona,
        account: address,
      });
    } catch (error) {
      console.error('Error minting journey NFT:', error);
      throw error;
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
