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
        console.log("Connected Account:", address);

        window.ethereum.on("accountsChanged", (accounts) => {
          setCurrentAccount(accounts[0] || "");
          console.log("Account changed:", accounts[0]);
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
        console.log("Contract Instance Loaded:", contract);

        const status = await contract.isComplete();
        setStatus(status);

        const contractOwner = await contract.getManager();
        console.log("Contract Owner:", contractOwner);
        setOwner(contractOwner);
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

      const declaredWinner = await contractInstance.getWinner();
      setWinner(declaredWinner);
      setStatus(true);
      setWinnerDeclared(true);
    } catch (error) {
      console.error("Error picking winner:", error);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4 pt-6 md:p-6 lg:p-8 mt-10 bg-gray-100 rounded-lg shadow-md">
      <nav className="flex justify-between mb-4">
        <button
          className="text-lg font-bold text-gray-600 hover:text-blue-500 transition duration-300"
          onClick={() => navigate("/")}
        >
          Home
        </button>
      </nav>

      <h1 className="text-3xl font-bold text-center mb-4">Pick Winner </h1>
      <div className="flex flex-col items-center">
        {winnerDeclared ? (
          winner.toLowerCase() === currentAccount.toLowerCase() ? (
            <div className="bg-green-500 p-4 rounded-lg shadow-md text-white text-center animate-pulse">
              🎉 Congratulations! You are the Winner: {winner}
            </div>
          ) : (
            <div className="bg-red-500 p-4 rounded-lg shadow-md text-white text-center">
              ❌ Better Luck Next Time!
            </div>
          )
        ) : currentAccount === owner ? (
          <button
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            onClick={pickWinner}
          >
            Pick Winner
          </button>
        ) : (
          <p className="text-lg">⏳ Waiting for result...</p>
        )}
      </div>
    </div>
  );
}

export default Pickwinner;
