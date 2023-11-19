"use client";

import { useEffect, useRef, useState} from 'react';
import { ethers } from 'ethers';
import { keccak256 } from 'ethers/lib/utils';
import { ConnectButton } from '../components/ConnectButton';
import { usePrepareContractWrite, useContractWrite, useContractRead, UseContractReadsConfig, useWaitForTransaction, useAccount} from 'wagmi'

import DecentralizedVotingABI from '../abi/DecentralizedVoting.json';
import './styles.css'

export default function Page() {

  const { address } = useAccount();

  const [description, setDescription] = useState('');
  const [visibleHash, setVisibleHash] = useState('');
  const [duration, setDuration] = useState(3600);

  const [voteId, setVoteId] = useState(1);
  const [voteChoice, setVoteChoice] = useState(true);

  const [isModalVisible, setModalVisible] = useState(false);

  const {
    config,
    error: prepareError,
    isError: isPrepareError,
  } = usePrepareContractWrite({
    address: '0xD0A8CB4e11f30E4FA722713Efbb6e111CEc320eD',
    abi: DecentralizedVotingABI,
    functionName: 'proposeVote',
    args: [visibleHash, duration],
  })
  const { data, error, isError, write } = useContractWrite(config)

  const {
    config: configCastVote,
    error: prepareErroCastVoter,
    isError: isPrepareErrorCastVote,
  } = usePrepareContractWrite({
    address: '0xD0A8CB4e11f30E4FA722713Efbb6e111CEc320eD',
    abi: DecentralizedVotingABI,
    functionName: 'castVote',
    args: [voteId, voteChoice],
  })
  const { data: dataCastVote, error: errorCastVote, isError: isErrorCastVote, write: writeCastVote } = useContractWrite(configCastVote)
 
  const { isLoading, isSuccess } = useWaitForTransaction({
    hash: data?.hash,
  })

  // Function to convert description to its hash and display it
  const calculateHash = () => {
      const hash = keccak256(ethers.utils.toUtf8Bytes(description));
      setVisibleHash(hash);
  }  
  
  const castVote = async (_voteChoice: boolean) => {
      setVoteChoice(_voteChoice);
      setTimeout(() => {
          writeCastVote?.();
      }, 500);
  };

  const proposeVote = async () => {
    if(visibleHash != "" && duration > 0)
    write?.();
  };

  const { data: readData } = useContractRead({
      address: '0xD0A8CB4e11f30E4FA722713Efbb6e111CEc320eD',
      abi: DecentralizedVotingABI,
      functionName: 'getVoteResults',
      args: [1],
      onSuccess(data) {
        console.log('Success', data)
      },
  });

  const [positiveVotes, negativeVotes] = Array.isArray(readData) ? readData : [null, null];

  useEffect(() => {
    if (isSuccess) {
        setModalVisible(true);
    }
}, [isSuccess]);

  return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
          <div className="bg-white p-8 rounded-lg shadow-md text-center mb-8 w-1/2">
              <h1 className="text-2xl font-semibold mb-4">
                  Decentralized Voting
              </h1>
              <label className="text-base mb-4">
              0xD0A8CB4e11f30E4FA722713Efbb6e111CEc320eD
              </label>

              <div className="flex justify-center mt-4">
                  <ConnectButton />
              </div>

              {address &&
              <>
                  <div className="mt-4">
                      <h2 className="text-xl mt-4">Propose a new vote:</h2>

                      <textarea
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder="Vote description"
                          className="mt-2 border p-2 rounded w-full"
                      ></textarea>

                      <button
                          onClick={calculateHash}
                          className="mt-4 px-4 py-2 rounded bg-gray-500 text-white"
                          disabled={description == ""}
                      >
                          Calculate Hash
                      </button>

                      {visibleHash && (
                          <div className="mt-4">
                              <p>Calculated Hash:</p>
                              <textarea
                                  value={visibleHash}
                                  readOnly
                                  className="mt-2 border p-2 rounded w-full"
                              ></textarea>
                          </div>
                      )}

                      <input
                          type="number"
                          value={duration}
                          onChange={(e) => setDuration(parseInt(e.target.value))}
                          placeholder="Duration in seconds"
                          className="mt-2 border p-2 rounded w-full"
                      />

                    {visibleHash != "" &&
                      <button
                          onClick={proposeVote}
                          className="mt-4 px-4 py-2 rounded bg-blue-500 text-white"
                          disabled={duration <= 0}
                      >
                          Propose Vote
                      </button>
                    }

                </div>

                <div className="bg-white p-8 rounded-lg shadow-lg text-center mt-20">
                  <h2 className="text-2xl font-semibold mb-4">
                      Votes Results
                  </h2>
                  <div className="flex flex-col space-y-4">
                      <div>
                          <h3 className="text-xl">Positive Votes:</h3>
                          <p>{positiveVotes !== null ? positiveVotes.toString() : '0'}</p>
                      </div>
                      <div>
                          <h3 className="text-xl">Negative Votes:</h3>
                          <p>{negativeVotes !== null ? negativeVotes.toString() : '0'}</p>
                      </div>
                  </div>
                  <div className="flex justify-center space-x-4 mt-4">
                      <button 
                          onClick={() => castVote(true)} 
                          className="px-4 py-2 rounded bg-green-600 text-white"
                      >
                          Vote YES
                      </button>
                      <button 
                          onClick={() => castVote(false)} 
                          className="px-4 py-2 rounded bg-red-600 text-white"
                      >
                          Vote NO
                      </button>
                  </div>
              </div>

              </>
              }
          </div>
      </div>
  );
}
