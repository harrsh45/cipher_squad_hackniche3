import React, { useState, useEffect } from "react";
import { ethers, Contract } from "ethers"; 
import contractConfig from "../config/constants";

function Home() {
  const [currentAccount, setCurrentAccount] = useState("");
  const [contractInstance, setContractInstance] = useState(null);
  const [status, setStatus] = useState(false);
  const [isWinner, setIsWinner] = useState("");
  const [currentPage, setCurrentPage] = useState("home");

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
          setCurrentAccount(accounts[0]);
          console.log("Account changed:", accounts[0]);
        });
      } catch (err) {
        console.error("Error connecting wallet:", err);
      }
    };

    const initializeContract = async () => {
      if (!currentAccount) return;

      try {
        const provider = new ethers.BrowserProvider(window.ethereum); 
        const signer = await provider.getSigner();
        const contractIns = new Contract(
          contractConfig.contractAddress,
          contractConfig.contractAbi,
          signer
        );

        setContractInstance(contractIns);
      } catch (error) {
        console.error("Error initializing contract:", error);
      }
    };

    const fetchContractData = async () => {
      if (!contractInstance) return;

      try {
        const status = await contractInstance.isComplete();
        setStatus(status);

        const winner = await contractInstance.getWinner();
        setIsWinner(winner === currentAccount);
      } catch (error) {
        console.error("Error fetching contract data:", error);
      }
    };

    loadBlockchainData();
    initializeContract();
    fetchContractData();
  }, [currentAccount]); // ✅ React will re-run this when the account changes

  const enterLottery = async () => {
    if (!contractInstance) return;
    const tx = await contractInstance.enter({
      value: ethers.parseEther("0.001"),
    });
    await tx.wait();
  };

  const claimPrize = async () => {
    if (!contractInstance) return;
    const tx = await contractInstance.claimPrize();
    await tx.wait();
  };

  const pickWinner = async () => {
    if (!contractInstance) return;
    const tx = await contractInstance.pickWinner();
    await tx.wait();
  };

  return (
    <div className="max-w-5xl mx-auto p-4 pt-6 md:p-6 lg:p-8 mt-10 bg-gray-100 rounded-lg shadow-md">
      <nav className="flex justify-between mb-4">
        <button
          className={`text-lg font-bold ${currentPage === "home" ? "text-blue-500" : "text-gray-600"} hover:text-blue-500 transition duration-300`}
          onClick={() => setCurrentPage("home")}
        >
          Home
        </button>
        <button
          className={`text-lg font-bold ${currentPage === "pickWinner" ? "text-blue-500" : "text-gray-600"} hover:text-blue-500 transition duration-300`}
          onClick={() => setCurrentPage("pickWinner")}
        >
          Lottery Result
        </button>
      </nav>

      {currentPage === "home" && (
        <div>
          <h1 className="text-3xl font-bold text-center mb-4">Lottery Page</h1>
          <div className="flex flex-col items-center mb-4">
            <p className="text-lg">Connected Account: {currentAccount}</p>
          </div>

          <div className="bg-blue-500 rounded-lg shadow-md p-4 mb-4">
            <h2 className="text-lg font-bold text-white mb-2">Lottery Ticket</h2>
            <p className="text-md text-white mb-2">Price: 0.001 ETH</p>
            <p className="text-md text-white mb-2">Pool: 10 ETH</p>
            <p className="text-md text-white mb-2">Result Date: 2024-03-15</p>
          </div>

          <div className="flex flex-col items-center mb-4">
            {status ? (
              isWinner ? (
                <button
                  className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                  onClick={claimPrize}
                >
                  Claim Prize
                </button>
              ) : (
                <p className="text-lg">You are not the winner</p>
              )
            ) : (
              <button
                className="bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded"
                onClick={enterLottery}
              >
                Buy Lottery Ticket
              </button>
            )}
          </div>
        </div>
      )}

      {currentPage === "pickWinner" && (
        <div>
          <h1 className="text-3xl font-bold text-center mb-4">Pick Winner Page</h1>
          <div className="flex flex-col items-center mb-4">
            <button
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
              onClick={pickWinner}
            >
              Pick Winner
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
