
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { contractAddresses } from '@/lib/contract-addresses';
import { parseEther } from 'viem';

// Journey NFT ABI - only the functions we need
const JOURNEY_NFT_ABI = [
  {
    inputs: [
      { name: "to", type: "address" },
      { name: "vesselId", type: "string" },
      { name: "originPort", type: "string" },
      { name: "destinationPort", type: "string" },
      { name: "departureDate", type: "string" },
      { name: "availableCapacityKg", type: "uint256" }
    ],
    name: "mintJourney",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "payable",
    type: "function"
  }
] as const;

export const useJourneyContract = () => {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const mintJourney = async (params: {
    to: string;
    vesselId: string;
    originPort: string;
    destinationPort: string;
    departureDate: string;
    availableCapacityKg: number;
  }) => {
    try {
      await writeContract({
        address: contractAddresses.journeyNFT as `0x${string}`,
        abi: JOURNEY_NFT_ABI,
        functionName: 'mintJourney',
        args: [
          params.to as `0x${string}`,
          params.vesselId,
          params.originPort,
          params.destinationPort,
          params.departureDate,
          BigInt(params.availableCapacityKg)
        ],
        value: parseEther('0.001'), // Small fee for minting
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
