
import { useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { contractAddresses } from '@/lib/contract-addresses';
import { polygonZkEvmCardona } from 'wagmi/chains';

// Journey NFT ABI - corrected to match the actual contract
const JOURNEY_NFT_ABI = [
  {
    inputs: [
      { name: "to", type: "address" },
      { name: "vesselTokenId", type: "uint256" },
      { name: "originPort", type: "string" },
      { name: "destinationPort", type: "string" },
      { name: "departureTimestamp", type: "uint256" },
      { name: "availableCapacityKg", type: "uint256" }
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
    availableCapacityKg: number;
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
          BigInt(params.availableCapacityKg)
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
