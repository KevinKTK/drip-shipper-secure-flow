import { useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { CONTRACT_ADDRESSES } from '@/lib/walletSecrets.ts';
import { polygonZkEvmCardona } from 'wagmi/chains';
import JourneyNFT from '../../contracts/ABI/JourneyNFT.json';

// The 'mintJourney' function in the contract
// NOTE: The full ABI is now imported from the JSON file. This is more robust.
// const JOURNEY_NFT_ABI = [ ... ]

export const useJourneyContract = () => {
  const { address } = useAccount();
  const { writeContract, data: hash, isPending, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const mintJourney = async (params: {
    vesselTokenId: string;
    originPort: string;
    destinationPort: string;
    departureTimestamp: number;
    expectedArrivalTimestamp: number;
    availableCapacity: string;
  }) => {
    try {
      console.log('Minting Journey NFT with params:', {
        ...params,
        contractAddress: CONTRACT_ADDRESSES.journeyNFT
      });

      // Updated validation logic
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
        address: CONTRACT_ADDRESSES.journeyNFT as `0x${string}`,
        abi: JourneyNFT.abi,
        functionName: 'mintJourney',
        args: [
          BigInt(params.vesselTokenId),
          params.originPort,
          params.destinationPort,
          BigInt(params.departureTimestamp),
          BigInt(params.expectedArrivalTimestamp),
          BigInt(params.availableCapacity)
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