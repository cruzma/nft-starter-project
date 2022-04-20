import React, { useEffect, useState } from 'react';
import './styles/App.css';
import twitterLogo from './assets/twitter-logo.svg';
import { ethers } from "ethers";
import myEpicNft from './utils/MyEpicNFT.json'

// Constants
const TWITTER_HANDLE = 'bet_hold';
const TWITTER_LINK = `https://twitter.com/${bet_hold}`;
const OPENSEA_LINK = '';
const TOTAL_MINT_COUNT = 50;

//moved contract address to the top for easy access
const CONTRACT_ADDRESS = "0x35ab51273634761134b77A2541163De81A3602e5"

const App = () => {

  /*
  * Just a state variable we use to store our user's public wallet. Dont forget to import useState
  */
  const [currentAccount, setCurrentAccount] = useState("");
  
  const checkIfWalletIsConnected = async () => {
    /*
    * First make sure we have access to window.ethereum
    */
    const { ethereum } = window;
  
    if(!ethereum){
      console.log("Make sure you have metamask!")
    } else {
      console.log("we have the ethereum object", ethereum);
    }

    /*
    * Check if we are authorized to acces the users wallet
    */
    const accounts = await ethereum.request({ method: 'eth_accounts' });

    /*
    * User can have mulitiple authorized accounts, we grab the first one if its there!
    */
    if (accounts.length !== 0){
      const account = accounts[0];
      console.log("Found an authorized account", account);
      setCurrentAccount(account);
    } else {
      console.log("No authorized account found");
    }
    
  }
  /*
  *Implement your connectWallet method here
  */

  const connectWallet = async () => {
    try{
      const { ethereum } = window;

      if(!ethereum) {
        alert("Get metamask")
        return;
      }
      // fancy method to request access to account.
      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

      // BOOM! this should print out public addess once we authorize Metamask
      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);



      //Setup Listener! This is for the case where a user comes to our site
      // and connedted their wallet for the first time.
      setupEventListener()
    } catch(error){
      console.log(error)
    }
  }

  //setup our listener
  const setupEventListener = async () => {
    //Most of this looks the same as our function askContractToMintNft
    try{
      const { ethereum } = window;
      if(ethereum){
        //same stuff again
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer);


        //THIS IS THE MAGIC SAUCE.
        //This will essentially "capture" our event when our contract throws it.
        // If you're familliar with webhooks, it very similiar to that!

        connectedContract.on("NewEpicNFTMinted", (from, tokenId) => {
          console.log(from, tokenId.toNumber());
          alet(`Hey There! We've minted your NFT and sent it to your wallet. It may be blank right now. It can take a max of 10 min to show up on OpenSea https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()} if your impatient try Rarible https://rinkeby.rarible.com/token/${CONTRACT_ADDRESS}:${tokenId.toNumber()}`);
        })

        console.log("setup event listener")
      } else {
        console.log("Ethereum object doesn't exist!")
      }
    } catch(error){
      console.log(error)
    }
  }

  const askContractToMintNft = async () => {
    
    try{
      const { ethereum } = window;

      if(ethereum){
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer);

        console.log("Going to pop wallet now to pay gas...")
        let nftTxn = await connectedContract.makeAnEpicNFT();
        
        console.log("Mining...please wait.")
        await nftTxn.wait();

        console.log(`Mined, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`);
      } else {
        console.log("Ethereum object doesnt exist!");
      }
    } catch(error){
      console.log(error)
    }
  }
  
  // Render Methods
  const renderNotConnectedContainer = () => (
    <button onClick={connectWallet} className="cta-button connect-wallet-button">
      Connect to Wallet
    </button>
  );

    const renderMintUI = () => (
    <button onClick={askContractToMintNft} className="cta-button connect-wallet-button">
      Mint NFT
    </button>
  )

  /*
  * This runs our function when the page loads
  */
  useEffect(() => {
    checkIfWalletIsConnected();
  }, [])

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">My NFT Collection</p>
          <p className="sub-text">
            Each unique. Each beautiful. Discover your NFT today.
          </p>
          {currentAccount === "" ? (
            renderNotConnectedContainer()
          ) : (
            renderMintUI()
          )}
        </div>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built on @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;