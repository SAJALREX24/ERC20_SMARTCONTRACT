import { useState, useEffect } from "react";
import { ethers } from "ethers";
import erc20abi from "./ERC20abi.json";
import ErrorMessage from "./ErrorMessage";
import TxList from "./TxList";

export default function App() {
  const [txs, setTxs] = useState([]);
  const [contractListened, setContractListened] = useState();
  const [error, setError] = useState();
  const [contractInfo, setContractInfo] = useState({
    address: "-",
    tokenName: "-",
    tokenSymbol: "-",
    totalSupply: "-",
  });
  const [balanceInfo, setBalanceInfo] = useState({
    address: "-",
    balance: "-",
  });

  useEffect(() => {
    if (contractInfo.address !== "-") {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const erc20 = new ethers.Contract(
        contractInfo.address,
        erc20abi,
        provider
      );

      erc20.on("Transfer", (from, to, amount, event) => {
        console.log({ from, to, amount, event });

        setTxs((currentTxs) => [
          ...currentTxs,
          {
            txHash: event.transactionHash,
            from,
            to,
            amount: String(amount),
          },
        ]);
      });
      setContractListened(erc20);

      return () => {
        contractListened.removeAllListeners();
      };
    }
  }, [contractInfo.address]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData(e.target);
    const provider = new ethers.providers.Web3Provider(window.ethereum);

    const erc20 = new ethers.Contract(data.get("addr"), erc20abi, provider);

    const tokenName = await erc20.name();
    const tokenSymbol = await erc20.symbol();
    const totalSupply = await erc20.totalSupply();

    setContractInfo({
      address: data.get("addr"),
      tokenName,
      tokenSymbol,
      totalSupply,
    });
  };

  const getMyBalance = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const erc20 = new ethers.Contract(contractInfo.address, erc20abi, provider);
    const signer = await provider.getSigner();
    const signerAddress = await signer.getAddress();
    const balance = await erc20.balanceOf(signerAddress);

    setBalanceInfo({
      address: signerAddress,
      balance: String(balance),
    });
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    const data = new FormData(e.target);
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = await provider.getSigner();
    const erc20 = new ethers.Contract(contractInfo.address, erc20abi, signer);
    const amount = ethers.utils.parseUnits(data.get("amount"), 18);

    await erc20.transfer(data.get("recipient"), amount);
  };

  const handleMint = async (e) => {
    e.preventDefault();
    const data = new FormData(e.target);
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = await provider.getSigner();
    const erc20 = new ethers.Contract(contractInfo.address, erc20abi, signer);
    await erc20.mint(
      "0x7535f6Eceaa4E8B40dD450f7eB1B91bd5Ca01c98",
      data.get("value")
    );
  };

  const handleBurn = async (e) => {
    e.preventDefault();
    const data = new FormData(e.target);
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = await provider.getSigner();
    const erc20 = new ethers.Contract(contractInfo.address, erc20abi, signer);
    await erc20.burn(data.get("value"));
  };

  const handlePause = async (e) => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = await provider.getSigner();
    const erc20 = new ethers.Contract(contractInfo.address, erc20abi, signer);
    await erc20.pause();
  };

  const handleUnPause = async (e) => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = await provider.getSigner();
    const erc20 = new ethers.Contract(contractInfo.address, erc20abi, signer);
    await erc20.unpause();
  };

  return (
    <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
      <div>
        <form className="m-4" onSubmit={handleSubmit}>
          <div className="bg-red-100 p-6 rounded-xl shadow-lg">
            <main>
              <h1 className="text-xl font-semibold text-green-700 text-center mb-4">
                Read from smart contract
              </h1>
              <div>
                <input
                  type="text"
                  name="addr"
                  className="border border-green-300 rounded-md w-full py-2 px-3 mb-3 placeholder-green-400 focus:outline-none focus:ring focus:ring-green-200"
                  placeholder="ERC20 contract address"
                />
              </div>
            </main>
            <footer>
              <button
                type="submit"
                className="bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 focus:outline-none focus:ring focus:ring-green-200"
              >
                Get token info
              </button>
            </footer>
            <div className="mt-4">
              <table className="table-auto w-full">
                <tbody>
                  <tr>
                    <th className="text-red-700">{contractInfo.tokenName}</th>
                    <td className="text-red-700">{contractInfo.tokenSymbol}</td>
                    <td className="text-red-700">{String(contractInfo.totalSupply)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="mt-4">
              <button
                onClick={getMyBalance}
                type="submit"
                className="bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 focus:outline-none focus:ring focus:ring-green-200"
              >
                Get my balance
              </button>
            </div>
            <div className="mt-4">
              <table className="table-auto w-full">
                <tbody>
                  <tr>
                    <th className="text-red-700">{balanceInfo.address}</th>
                    <td className="text-red-700">{balanceInfo.balance}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </form>
        <div className="mt-4 bg-red-100 p-6 rounded-xl shadow-lg">
          <div>
            <h1 className="text-xl font-semibold text-green-700 text-center mb-4">
              Mint Tokens
            </h1>
            <form onSubmit={handleMint}>
              <div>
                <input
                  type="text"
                  name="value"
                  className="border text-red-700 border-green-300 rounded-md w-full py-2 px-3 mb-3 placeholder-red-400 focus:outline-none focus:ring focus:ring-red-200"
                  placeholder="Amount to Mint"
                />
              </div>
              <footer>
                <button
                  type="submit"
                  className="bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 focus:outline-none focus:ring focus:ring-green-200"
                >
                  Mint
                </button>
              </footer>
            </form>
          </div>
        </div>
        <div className="mt-4 bg-red-100 p-6 rounded-xl shadow-lg">
          <div>
            <h1 className="text-xl font-semibold text-green-700 text-center mb-4">
              Burn Tokens
            </h1>
            <form onSubmit={handleBurn}>
              <div>
                <input
                  type="text"
                  name="value"
                  className="border text-red-700 border-green-300 rounded-md w-full py-2 px-3 mb-3 placeholder-red-400 focus:outline-none focus:ring focus:ring-red-200"
                  placeholder="Amount to Burn"
                />
              </div>
              <footer>
                <button
                  type="submit"
                  className="bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 focus:outline-none focus:ring focus:ring-green-200"
                >
                  Burn
                </button>
              </footer>
            </form>
          </div>
        </div>
        <div className="mt-4 bg-red-100 p-6 rounded-xl shadow-lg">
          <div>
            <h1 className="text-xl font-semibold text-green-700 text-center mb-4">
              Transfer Token
            </h1>
            <form onSubmit={handleTransfer}>
              <div>
                <input
                  type="text"
                  name="recipient"
                  className="border text-red-700 border-green-300 rounded-md w-full py-2 px-3 mb-3 placeholder-red-400 focus:outline-none focus:ring focus:ring-red-200"
                  placeholder="Recipient address"
                />
              </div>
              <div>
                <input
                  type="text"
                  name="amount"
                  className="border text-red-700 border-green-300 rounded-md w-full py-2 px-3 mb-3 placeholder-red-400 focus:outline-none focus:ring focus:ring-red-200"
                  placeholder="Amount to transfer"
                />
              </div>
              <footer>
                <button
                  type="submit"
                  className="bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 focus:outline-none focus:ring focus:ring-green-200"
                >
                  Transfer
                </button>
              </footer>
            </form>
          </div>
        </div>
        <button
  onClick={handlePause}
  className="bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 focus:outline-none focus:ring focus:ring-green-200 mt-4 block w-full"
>
  CHAIN PAUSE
</button>
<button
  onClick={handleUnPause}
  className="bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 focus:outline-none focus:ring focus:ring-green-200 mt-4 block w-full"
>
  CHAIN UNPAUSE 
</button>

      </div>
    </div>
  );
}
