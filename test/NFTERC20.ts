import { ethers } from "hardhat";
import { Contract, Signer } from "ethers";
import { expect } from "chai";
import { ERC20Token__factory } from "../typechain-types";

describe("NFTDutchAuction_ERC20Bids", function () {
    let contract: Contract;
    let owner;
    let bidder1;
    let bidder2;
    let accounts;
    let eRCToken;
    let nftContractToken;



    beforeEach(async function () {
        // Deploy the NFTDutchAuctionToken and ERC20Token contracts
        const NFTDutchAuctionToken = await ethers.getContractFactory("NFTDutchAuctionToken");
        const ERC20Token = await ethers.getContractFactory("ERC20Token");

        // Get the contract factory for NFTDutchAuction_ERC20Bids
        const Contract = await ethers.getContractFactory("NFTDutchAuction_ERC20Bids");

        // Get the owner and bidders signers
        accounts = await ethers.getSigners();
        owner = accounts[0];
        bidder1 = accounts[1];
        bidder2 = accounts[2];

        // Deploy the NFTDutchAuctionToken contract
        const nftContractToken = await NFTDutchAuctionToken.deploy();
        await nftContractToken.deployed();



        // Deploy the ERC20Token contract
        const eRCToken = await ERC20Token.connect(bidder1).deploy();
        await eRCToken.deployed();

        // Set up initial parameters for the NFTDutchAuction_ERC20Bids contract
        const reservePrice = 100;
        const numBlocksAuctionOpen = 10;
        const offerPriceDecrement = 10;
        const nftTokenId = 0;
        const erc721TokenAddress = nftContractToken.address;
        const erc20TokenAddress = eRCToken.address;

        //mint a ERC721 token to the owner
        await nftContractToken.connect(bidder1).safeMint(owner.address, nftTokenId);
        //mint token to ERC token to Bidders

        // Deploy the NFTDutchAuction_ERC20Bids contract
        try{
        contract = await Contract.deploy(
            reservePrice,
            numBlocksAuctionOpen,
            offerPriceDecrement,
            nftTokenId,
            erc721TokenAddress,
            erc20TokenAddress
        );
            await contract.deployed();
            expect.fail('Ownable: caller is not the owner');
        } catch (e: any) {
            expect(e.message).to.be.equal("VM Exception while processing transaction: reverted with reason string 'Ownable: caller is not the owner'");
        }
    

        
    });


});
