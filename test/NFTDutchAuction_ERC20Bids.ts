import { ethers } from "hardhat";
import { Contract, Signer } from "ethers";
import { expect } from "chai";
import { ERC20Token__factory } from "../typechain-types";


//function to get VRS

async function getPermitSignature(
    signer,
    token,
    spender,
    value,
    deadline
): Promise<ethers.utils.SplitSignature> {
    // Fetch necessary values from the token and signer
    const [nonce, name, version, chainId] = await Promise.all([
        token.nonces(signer.address),
        token.name(),
        "1",
        signer.getChainId(),
    ]);

    // Generate the permit signature using _signTypedData
    return ethers.utils.splitSignature(
        await signer._signTypedData(
            {
                name,
                version,
                chainId,
                verifyingContract: token.address,
            },
            {
                Permit: [
                    {
                        name: "owner",
                        type: "address",
                    },
                    {
                        name: "spender",
                        type: "address",
                    },
                    {
                        name: "value",
                        type: "uint256",
                    },
                    {
                        name: "nonce",
                        type: "uint256",
                    },
                    {
                        name: "deadline",
                        type: "uint256",
                    },
                ],
            },
            {
                owner: signer.address,
                spender,
                value,
                nonce,
                deadline,
            }
        )
    );
}


describe("NFTDutchAuction_ERC20Bids", () => {

    let contract;
    let owner;
    let bidder1;
    let bidder2;
    let accounts;
    let eRCToken;
    let nftContractToken;
    let NFTDutchAuctionToken;
    const reservePrice = 100;
    const numBlocksAuctionOpen = 10;
    const offerPriceDecrement = 10;
    const nftTokenId = 0;


    beforeEach(async () => {
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

        const erc721TokenAddress = nftContractToken.address;
        const erc20TokenAddress = eRCToken.address;

        //mint a ERC721 token to the owner
        await nftContractToken.connect(owner).safeMint(owner.address, nftTokenId);
        //minting with non-owner
        try {
            await nftContractToken.connect(bidder1).safeMint(owner.address, nftTokenId);
        } catch (e: any) {
            // expect(e.message).to.be.equal("");
            console.log(e.message);
        }
        //mint token to ERC token to Bidders

        // Deploy the NFTDutchAuction_ERC20Bids contract
        contract = await Contract.deploy(
            reservePrice,
            numBlocksAuctionOpen,
            offerPriceDecrement,
            nftTokenId,
            erc721TokenAddress,
            erc20TokenAddress
        );

        await contract.deployed();

        let bidAmount = 1;
        //mint ERC20token to the bidder1
        await eRCToken.connect(bidder1).mint(bidder1.address, 1000000);
        //Minting ERC20 with non-owner
        try {
            await eRCToken.connect(bidder2).mint(bidder1.address, 1000000);
        } catch (e: any) {
            // expect(e.message).to.be.equal("");
            console.log(e.message);
        }
        console.log("bidder1 balance ", await eRCToken.connect(bidder1).balanceOf(bidder1.address));
        await eRCToken.connect(bidder1).transfer(contract.address, bidAmount);
        console.log("contrats balance ", await eRCToken.connect(bidder1).balanceOf(contract.address));
        //Aprove for the Dutchaction contract to move ERC721 token
        await nftContractToken.approve(contract.address, nftTokenId);
    });

    it("should initialize with the correct values ", async function () {
        expect(await contract.reservePrice()).to.equal(reservePrice);
        expect(await contract.numBlocksAuctionOpen()).to.equal(numBlocksAuctionOpen);
        expect(await contract.offerPriceDecrement()).to.equal(offerPriceDecrement);
        expect(await contract.nftTokenId()).to.equal(nftTokenId);
        expect(await contract.auctionEnded()).to.be.false;
        //expect(await nftContractToken.connect(bidder2).safeMint(bidder1.address, nftTokenId)).to.be.rejectedWith("Ownable: caller is not the owner");
    });

    it("should return insufficient bid amount for a bid below current price", async function () {

        let bidAmount = 1;

       expect( await contract.connect(bidder1).placeBid(bidAmount)).to.be.revertedWith("insuffient bid amount");

    });
   // describe('placeBid', () => {
   //     it('Attempt to call the safeMint function as a non-owner and expect it to revert', async () => {


            // Attempt to call the safeMint function as a non-owner and expect it to revert
   //         await expect(
   //             nftContractToken.connect(bidder1).safeMint(owner.address, 10)
   //         ).to.be.revertedWith("Ownable: caller is not the owner");

   //     });
    //});

    beforeEach(async () => {
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
        await nftContractToken.connect(owner).safeMint(owner.address, nftTokenId);
        //mint token to ERC token to Bidders

        // Deploy the NFTDutchAuction_ERC20Bids contract
        contract = await Contract.deploy(
            reservePrice,
            numBlocksAuctionOpen,
            offerPriceDecrement,
            nftTokenId,
            erc721TokenAddress,
            erc20TokenAddress
        );

        await contract.deployed();

        let bidAmount = 1000;
        const deadline = ethers.constants.MaxUint256;


        const { v, r, s } = await getPermitSignature(
            bidder1,
            eRCToken,
            contract.address,
            bidAmount,
            deadline
        );

        //mint ERC20token to the bidder1
        await eRCToken.connect(bidder1).mint(bidder1.address, 1000000);
        
        
        console.log("bidder1 balance ", await eRCToken.connect(bidder1).balanceOf(bidder1.address));
        await eRCToken.connect(bidder1).permit(bidder1.address, contract.address, bidAmount, deadline, v, r, s );
       // await eRCToken.connect(bidder1).transfer(contract.address, bidAmount);
        console.log("contrats balance ", await eRCToken.connect(bidder1).balanceOf(contract.address));
        //Aprove for the Dutchaction contract to move ERC721 token
        await nftContractToken.approve(contract.address, nftTokenId);
    });


    it("should process a bid successfully", async function () {

        let bidAmount = 1000;

        await contract.connect(bidder1).placeBid(bidAmount);
        expect(await contract.auctionEnded()).to.be.true;


    });




});
