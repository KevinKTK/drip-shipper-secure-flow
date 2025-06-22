
import { useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { CONTRACT_ADDRESSES } from '@/lib/walletSecrets.ts';
import { polygonZkEvmCardona } from 'wagmi/chains';
import JourneyNFT from '../../contracts/ABI/JourneyNFT.json';

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
      console.log('Minting Journey NFT with params:', {
        to: params.to,
        vesselTokenId: params.vesselTokenId,
        originPort: params.originPort,
        destinationPort: params.destinationPort,
        departureTimestamp: params.departureTimestamp,
        expectedArrivalTimestamp: params.expectedArrivalTimestamp,
        contractAddress: CONTRACT_ADDRESSES.journeyNFT
      });

      // Validate parameters before sending
      if (!params.to || !params.vesselTokenId || !params.originPort || !params.destinationPort) {
        throw new Error('Missing required parameters for Journey NFT minting');
      }

      if (params.departureTimestamp <= 0 || params.expectedArrivalTimestamp <= 0) {
        throw new Error('Invalid timestamp values');
      }

      if (params.expectedArrivalTimestamp <= params.departureTimestamp) {
        throw new Error('Expected arrival must be after departure');
      }

      // Convert vesselTokenId to BigInt and ensure all parameters are in correct format
      const vesselTokenIdBigInt = BigInt(params.vesselTokenId);
      const departureTimestampBigInt = BigInt(params.departureTimestamp);
      const expectedArrivalTimestampBigInt = BigInt(params.expectedArrivalTimestamp);

      console.log('Converted parameters:', {
        to: params.to,
        vesselTokenId: vesselTokenIdBigInt.toString(),
        originPort: params.originPort,
        destinationPort: params.destinationPort,
        departureTimestamp: departureTimestampBigInt.toString(),
        expectedArrivalTimestamp: expectedArrivalTimestampBigInt.toString()
      });

      // The `writeContract` function will trigger a wallet confirmation
      await writeContract({
        address: CONTRACT_ADDRESSES.journeyNFT as `0x${string}`,
        abi: JourneyNFT.abi,
        functionName: 'mintJourney',
        args: [
          params.to as `0x${string}`, // _to
          vesselTokenIdBigInt, // _vesselTokenId
          params.originPort, // _originPort
          params.destinationPort, // _destinationPort
          departureTimestampBigInt, // _departureTimestamp
          expectedArrivalTimestampBigInt // _expectedArrivalTimestamp
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
