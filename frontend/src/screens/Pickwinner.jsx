import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import contractConfig from "../config/constants";
import { useNavigate } from "react-router-dom";

function Pickwinner() {
  const [owner, setOwner] = useState("");
  const [contractInstance, setContractInstance] = useState(null);
  const [currentAccount, setCurrentAccount] = useState("");
  const [winner, setWinner] = useState("");
  const [status, setStatus] = useState(false);
  const [winnerDeclared, setWinnerDeclared] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loadBlockchainData = async () => {
      if (!window.ethereum) {
        alert("Please install MetaMask to use this application");
        return;
      }

      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        setCurrentAccount(address);

        window.ethereum.on("accountsChanged", (accounts) => {
          setCurrentAccount(accounts[0] || "");
          window.location.reload();
        });

        initializeContract(signer);
      } catch (err) {
        console.error("Error connecting wallet:", err);
      }
    };

    const initializeContract = async (signer) => {
      try {
        const contract = new ethers.Contract(
          contractConfig.contractAddress,
          contractConfig.contractAbi,
          signer
        );

        setContractInstance(contract);

        const status = await contract.isComplete();
        setStatus(status);

        const contractOwner = await contract.getManager();
        setOwner(contractOwner);

        // Get winner if lottery is completed
        if (status) {
          const declaredWinner = await contract.getWinner();
          setWinner(declaredWinner);
          setWinnerDeclared(true);
        }
      } catch (error) {
        console.error("Error initializing contract:", error);
      }
    };

    loadBlockchainData();
  }, []);

  const pickWinner = async () => {
    if (!contractInstance) return;
    try {
      const tx = await contractInstance.pickWinner();
      await tx.wait();

      // Fetch the new winner after transaction confirmation
      const declaredWinner = await contractInstance.getWinner();
      setWinner(declaredWinner);
      setStatus(true);
      setWinnerDeclared(true);
    } catch (error) {
      console.error("Error picking winner:", error);
    }
  };

  const claimPrize = async () => {
    if (!contractInstance || currentAccount.toLowerCase() !== winner.toLowerCase()) {
      alert("Only the winner can claim the prize!");
      return;
    }
    try {
      const tx = await contractInstance.claimPrize();
      await tx.wait();
      alert("Prize claimed successfully!");

      // Reset lottery state after claiming
      setWinner("");
      setStatus(false);
      setWinnerDeclared(false);
    } catch (error) {
      console.error("Error claiming prize:", error);
    }
  };

  const resetLottery = async () => {
    if (!contractInstance) return;
    try {
      const tx = await contractInstance.resetLottery();
      await tx.wait();

      setWinner("");
      setStatus(false);
      setWinnerDeclared(false);
    } catch (error) {
      console.error("Error resetting lottery:", error);
    }
  };

  return (
    <div className="home-back animated-gradient h-screen mx-auto p-4 pt-6 md:p-6 lg:p-8 rounded-lg shadow-md">
      <nav className="flex justify-between mb-4">
        <button
          className="text-lg font-bold text-white hover:text-black transition duration-300"
          onClick={() => navigate("/")}
        >
          Home
        </button>
      </nav>
      <h1 className="text-3xl font-bold text-center mb-4">Pick Winner</h1>
      <div className="flex flex-col items-center">
        {winnerDeclared ? (
          winner.toLowerCase() === currentAccount.toLowerCase() ? (
            <div className="bg-green-500 p-4 rounded-lg shadow-md text-white text-center animate-pulse">
              🎉 Congratulations! You are the Winner: {winner}
              <button
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mt-2"
                onClick={claimPrize}
              >
                Claim Prize
              </button>
            </div>
          ) : (
            <div className="bg-red-500 p-4 rounded-lg shadow-md text-white text-center">
              ❌ Better Luck Next Time!
            </div>
          )
        ) : currentAccount === owner ? (
          <div className="flex gap-3">
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              onClick={pickWinner}
            >
              Pick Winner
            </button>
            <button
              onClick={resetLottery}
              className="bg-red-500 hover:bg-red-700 text-white font-bold p-2 rounded"
            >
              Reset Lottery
            </button>
          </div>
        ) : (
          <p className="text-lg">⏳ Waiting for result...</p>
        )}
      </div>
    </div>
  );
}

export default Pickwinner;