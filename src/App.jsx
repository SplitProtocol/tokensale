import { useState, useEffect } from "react"
import { ethers } from "ethers"
import Header from "./components/Header"
import Footer from "./components/Footer"
import ClaimWindow from "./components/ClaimWindow"

export default function App() {
    const [provider, setProvider] = useState(null);
    const [signer, setSigner] = useState(null);
    const [userAddress, setUserAddress] = useState('');
    const [network, setNetwork] = useState(null);
    const cID = "0x89";

    useEffect(() => {
        if (window.ethereum) {
            const p = new ethers.BrowserProvider(window.ethereum);
            setProvider(p);
        }
    }, []);

    async function connectWallet() {
        try {
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            const provider = new ethers.BrowserProvider(window.ethereum);
            setProvider(provider);
            const network = await provider.getNetwork();
            setNetwork(network);
            if (network.chainId !== 137) {
                await switchNetwork();
            }
            const signer = await provider.getSigner();
            setSigner(signer);
            const addr = await signer.getAddress();
            setUserAddress(addr);
        } catch(err) {
            alert("Error connecting to Metamask" + err);
        }
    }

    async function switchNetwork() {
        try {
            await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [
                    {
                        chainId: cID,
                        chainName: "Polygon Mainnet",
                        nativeCurrency: {
                            name: "MATIC",
                            symbol: "MATIC",
                            decimals: 18
                        },
                        rpcUrls: ['https://polygon-rpc.com/'],
                        blockExplorerUrls: ['https://polygonscan.com/']
                    }
                ]
            });
        } catch(addNetworkError) {
            alert("Not able to add network: " + addNetworkError);
            console.log(addNetworkError);
        }
    }

    function printAddress(addr) {
        const p1 = (addr + '').substring(0, 4);
        const p2 = (addr + '').slice(-4);
        return p1 + '...' + p2;
    }

    window.ethereum?.on('accountsChanged', function(newAccounts) {
        setUserAddress(newAccounts[0]);
    });

    return (
        <>
        <Header userAddress={userAddress} connectWallet={connectWallet} printAddress={printAddress} />
        <ClaimWindow provider={signer} addr={userAddress} isMetamaskActive={userAddress !== ''} />
        <Footer />
        </>
    )
}