// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;
import "./NFTdutchauctiontoken.sol";
import "./ERC20TokenWithPermit.sol";


contract NFTDutchAuction_ERC20Bids {
    NFTDutchAuctionToken public nftContractToken;
    ERC20Token public eRCToken;
    address payable public seller;
    address public ownerOfToken;
    address public erc20TokenAddress;
    address public erc721TokenAddress;
    uint256 public reservePrice;
    uint256 public numBlocksAuctionOpen;
    uint256 public offerPriceDecrement;
    uint256 public startBlock;
    uint256 public endBlock;
    uint256 public currentPrice;
    uint256 public nftTokenId;
    bool public auctionEnded;
    uint256 public bidTransfered;

    //Seller Placed A bid

    constructor(
        uint256 _reservePrice,
        uint256 _numBlocksAuctionOpen,
        uint256 _offerPriceDecrement,
        uint256 _nftTokenId,
        address _erc721TokenAddress,
        address _erc20TokenAddress
    ) {
        seller = payable(msg.sender);
        reservePrice = _reservePrice;
        numBlocksAuctionOpen = _numBlocksAuctionOpen;
        offerPriceDecrement = _offerPriceDecrement;
        nftTokenId = _nftTokenId;
        erc721TokenAddress = _erc721TokenAddress;
        erc20TokenAddress = _erc20TokenAddress;
        startBlock = block.number;
        endBlock = startBlock + numBlocksAuctionOpen;
        ownerOfToken = IERC721(_erc721TokenAddress).ownerOf(_nftTokenId);

        auctionEnded = false;
        //check if the the deployer is the owner of the token.
        require(seller == ownerOfToken, "Sender is not the owner of token");
    }

    //function for bidders to place bid and proccess the bid
    function getCurrentPrice() public returns (uint256) {
        currentPrice =
            reservePrice +
            (endBlock - block.number) *
            offerPriceDecrement;
        return (currentPrice);
    }

    function placeBid(uint256 _bidAmount) external payable returns (string memory) {
        getCurrentPrice();
        if (_bidAmount >= currentPrice) {
            auctionEnded = true;
             IERC20(erc20TokenAddress).transferFrom(msg.sender, seller, _bidAmount);
            IERC721(erc721TokenAddress).safeTransferFrom(
                seller,
                msg.sender,
                nftTokenId
            );
            return "bid processed successfully";
             //Transfer ERC721 Token to Bidder
           
        } else {
            return "insufficient bid amount";
        }
    }
}
