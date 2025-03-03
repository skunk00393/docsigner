import { ethers } from "ethers";
import { contractABI } from "./contractABI";

const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;

let contract;
let signer;
let provider;

export const initializeContract = async () => {
    if (window.ethereum) {
        provider = new ethers.BrowserProvider(window.ethereum);
        signer = await provider.getSigner();
        contract = new ethers.Contract(contractAddress, contractABI, signer);
    }
};

export const connectWallet = async () => {
    if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        return accounts[0];
    }
    return null;
};

export const signDocument = async (hashId, name) => {
    if (!contract) return;
    const tx = await contract.signDocument(hashId, name);
    await tx.wait();
};

export const fetchDocumentByHash = async (hashId) => {
    if (!contract) return;
    return await contract.getDocumentByHash(hashId);
};

export const fetchDocumentByName = async (name) => {
    if (!contract) return;
    return await contract.getDocumentByName(name);
};
