import './App.css';
import React from 'react'
import { ethers } from 'ethers';
import { useState , useEffect} from 'react';
import NFTPoll from './contracts/NFTPoll.sol/NFTPoll.json';

const nftAddress = "0x9A676e781A523b5d0C0e43731313A708CB607508";

function Test (){
    const [contract, setContract]=useState('undefined');
    const [signer,setSigner] = useState('');
    const [proposal,setProposal] = useState('');
    const [provider,setProvider] = useState('');
    const [accounts,setAccounts] = useState([]);

    async function connector (){
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(nftAddress, NFTPoll.abi, provider)
        setContract(contract);
        setSigner(signer);
        setProvider(provider);
        const { ethereum } = window
        await ethereum.enable()
        if (!ethereum) {
            console.log("Make sure you have Metamask installed!")
        return
        } else {
            console.log("Wallet exists! We're ready to go!")
        }
        const accounts = await ethereum.request({ method: "eth_accounts" })
        if (accounts.length !== 0) {
            const account = accounts[0]
            setAccounts(accounts);
            console.log("Found an authorized account: ", account)
        } else {
            console.log("No authorized account found")
        }
    }
    const takeVal = (event) => {
        setProposal(event.target.value);
    };
    async function getToken (){
        await contract.connect(signer).createToken()
    }
    async function makePro (e){
        await contract.connect(signer).createProposal(proposal)
    }
    async function closeVote () {
        await contract.connect(signer).conclude()
    }
    async function showPro () {
        const data = await contract.connect(signer).proposal()
        const ele = document.getElementById("proposal");
        ele.innerHTML = data
    }
    async function voteYes (e) {
        try {
            const ele = document.getElementById("allow");
            ele.innerHTML = ""
            await contract.connect(signer).vote(true);
        }
        catch (e){
            if (e.reason = "Error: VM Exception while processing transaction: reverted with reason string 'No more votes'") {
                const ele = document.getElementById("allow");
                ele.innerHTML = "You have already voted on all your NFTS"
            }
        }
    }
    async function voteNo (e) {
        const d = await contract.connect(signer).balanceOf(accounts[0]);
        console.log(d)
        try {
            const ele = document.getElementById("allow");
            ele.innerHTML = ""
            await contract.connect(signer).vote(false);
        }
        catch (e){
            if (e.reason = "Error: VM Exception while processing transaction: reverted with reason string 'No more votes'") {
                const ele = document.getElementById("allow");
                ele.innerHTML = "You have already voted on all your NFTS"
            }
        }
    }
    async function showResults () {
        const yesV = await contract.connect(signer).countYes();
        const noV = await contract.connect(signer).countNo();
        const over = await contract.connect(signer).concluded();
        const ele= document.getElementById("results");
        ele.innerHTML = `votes YES : ${yesV} ; votes NO: ${noV} ; Vote Concluded? : ${over}`
    }
    return (
        
        <div className="App">
        <button onClick={connector}> connect </button>
        <button onClick={getToken}>Get NFT</button>
        <div>
            <input id = "namePro" placeholder='enter proposal' onKeyUp={takeVal}></input>
            <button onClick={ makePro }>Make Proposal</button>
        </div>
        <div>
            <button onClick={ closeVote }>Close Proposal</button>
        </div>
        <button onClick={showPro}> See Proposal </button>
        <h4 id = "proposal"> </h4>
        <h3> VOTE </h3>
        <button id = "yes" onClick={voteYes}>YES</button>
        <button id = "no" onClick={voteNo}>NO</button>
        <p id = "allow"></p>
        <div>
            <button onClick={showResults}>See Result of Proposal</button>
            <p id ="results"></p>
        </div>
        </div>
    );
}

export default Test;
