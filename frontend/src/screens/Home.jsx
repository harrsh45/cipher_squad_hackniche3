import React, { useState, useEffect } from "react";
import { ethers, Contract } from "ethers";
import contractConfig from "../config/constants";
import { useNavigate } from "react-router-dom";

function Home() {
  const [currentAccount, setCurrentAccount] = useState("");
  const [contractInstance, setContractInstance] = useState(null);
  const [status, setStatus] = useState(false);
  const [isWinner, setIsWinner] = useState("");
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

        // Listen for account change
        window.ethereum.on("accountsChanged", (accounts) => {
          setCurrentAccount(accounts[0] || "");
          console.log("Account changed:", accounts[0]);
        });

        initializeContract(signer);
      } catch (err) {
        console.error("Error connecting wallet:", err);
      }
    };

    const initializeContract = async (signer) => {
      try {
        const contractIns = new Contract(
          contractConfig.contractAddress,
          contractConfig.contractAbi,
          signer
        );
        setContractInstance(contractIns);

        const status = await contractIns.isComplete();
        setStatus(status);

        const winner = await contractIns.getWinner();
        setIsWinner(winner.toLowerCase() === currentAccount.toLowerCase());
      } catch (error) {
        console.error("Error initializing contract:", error);
      }
    };

    loadBlockchainData();
  }, [currentAccount]);

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

  return (
    <div className=" w-full h-screen flex flex-col items-center justify-between gap-10">
      <div className=" min-h-screen w-[100%]  mx-auto  md:p-6 lg:p-8  bg-gray-100 home-back rounded-lg shadow-md">
        <nav className="flex justify-between mb-4">
          <button
            className="text-2xl font-bold text-white hover:text-green-300 transition duration-300"
            onClick={() => navigate("/")}
          >
            Home
          </button>
          <button
            className="text-2xl font-bold text-white hover:text-blue-500 transition duration-300"
            onClick={() => navigate("/pickwinner")}
          >
            Lottery Result
          </button>
        </nav>

        <h1 className="text-4xl font-bold text-center mb-28 animate-text-gradient bg-gradient-to-r from-yellow-300 via-white to-orange-300 bg-clip-text text-transparent drop-shadow-lg">
  Lottery Page
</h1>
        <div className="flex flex-col items-center mb-10">
          <p className="text-2xl font-bold text-white drop-shadow-lg">
            Connected Account: {currentAccount}
          </p>
        </div>

        <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 flex flex-col justify-center items-center w-[50%] ml-80 animate-gradient rounded-lg shadow-md p-4 mb-4 text-white">
          <h2 className="text-lg font-bold mb-2">Lottery Ticket</h2>
          <p className="text-md mb-2">Price: 0.001 ETH</p>
          <p className="text-md mb-2">Pool: 0.02 ETH</p>
          <p className="text-md mb-2">Result Date: 2024-03-15</p>
        </div>

        <div className="flex flex-col items-center">
          {status ? (
            <p>Wait for the result ⌛ </p>
          ) : (
            <button
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
              onClick={enterLottery}
            >
              Buy Lottery Ticket
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default Home;
