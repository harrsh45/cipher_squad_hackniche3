import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import constants from '../config/constants';

function Pickwinner() {
  const [owner, setOwner] = useState('');
  const [contractInstance, setContractInstance] = useState(null);
  const [currentAccount, setCurrentAccount] = useState('');
  const [isOwnerConnected, setIsOwnerConnected] = useState(false);
  const [winner, setWinner] = useState('');
  const [status, setStatus] = useState(false);

  useEffect(() => {
    const loadBlockchainData = async () => {
      if (typeof window.ethereum !== 'undefined') {
        const provider = new ethers.BrowserProvider(window.ethereum);

        try {
          const signer = await provider.getSigner();
          const address = await signer.getAddress();
          console.log('🔹 Current Account:', address);
          setCurrentAccount(address);

          window.ethereum.on('accountsChanged', (accounts) => {
            console.log('🔄 Changed Account:', accounts[0]);
            setCurrentAccount(accounts[0] || '');
          });
        } catch (err) {
          console.error("❌ Error fetching account:", err);
        }
      } else {
        alert('⚠ Please install MetaMask to use this application');
      }
    };

    loadBlockchainData();
  }, []);

  useEffect(() => {
    if (!currentAccount) return;

    const contractSetup = async () => {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();

        const contract = new ethers.Contract(
          constants.contractAddress,
          constants.contractAbi,
          signer
        );

        setContractInstance(contract);

        console.log("✅ Contract Instance:", contract);

        const status = await contract.isComplete();
        console.log("🔹 Lottery Status:", status);
        setStatus(status);

        try {
            const contractOwner = await contract.getManager();
            console.log("👑 Contract Owner:", contractOwner);
            setOwner(contractOwner);
          } catch (error) {
            console.error("❌ Error fetching contract owner:", error);
          }

        setOwner(contractOwner);
        setIsOwnerConnected(contractOwner.toLowerCase() === currentAccount.toLowerCase());
      } catch (err) {
        console.error("❌ Error loading contract:", err);
      }
    };

    contractSetup();
  }, [currentAccount]);

  const pickWinner = async () => {
    try {
      if (!contractInstance) return;

      console.log("🎲 Picking Winner...");
      const tx = await contractInstance.pickWinner();
      await tx.wait();

      const declaredWinner = await contractInstance.getWinner();
      console.log("🏆 Winner Declared:", declaredWinner);
      setWinner(declaredWinner);
      setStatus(true);
    } catch (error) {
      console.error("❌ Error picking winner:", error);
    }
  };

  return (
    <div
      className="max-w-5xl mx-auto p-4 pt-6 md:p-6 lg:p-8 mt-10"
      style={{
        backgroundImage: "linear-gradient(to bottom, #ff69b4, #ffe6cc)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        borderRadius: "10px",
        boxShadow: "0 0 10px rgba(0,0,0,0.1)",
      }}
    >
      <h1 className="text-3xl font-bold text-center mb-4 text-white">Result Page</h1>

      <div className="flex flex-col items-center mb-4">
        {status ? (
          <div className="bg-green-500 p-4 rounded-lg shadow-md text-white text-center animate-pulse">
            🎉 Lottery Winner: {winner}
          </div>
        ) : isOwnerConnected ? (
          <button
            className="bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded"
            onClick={pickWinner}
          >
            Pick Winner
          </button>
        ) : (
          <p className="text-lg text-white">⏳ Waiting for result...</p>
        )}
      </div>
    </div>
  );
}

export default Pickwinner;
