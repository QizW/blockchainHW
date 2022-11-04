// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// Uncomment the line to use openzeppelin/ERC20
// You can use this dependency directly because it has been installed already

// Uncomment this line to use console.log
// import "hardhat/console.sol";

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";


contract StudentSocietyDAO {

    struct Proposal {
        uint32 index;      // index of this proposal
        address proposer;  // who make this proposal
        uint256 startTime; // proposal start time
        uint256 duration;  // proposal duration
        string name;       // proposal name
        uint256 approval;
        uint256 disapproval;
        string content;//the content of the proposal
    }

    struct ReProposal{
        uint32 index;      // index of this proposal
        string name;       // proposal name
        uint256 approval;
        uint256 disapproval;
        string content;//the content of the proposal
        address proposer;
    }
    mapping(address => mapping(uint32 => bool)) answer;
    
    MyERC20 public studentERC20;
    MyERC721 public Gift;
    uint32 index = 0;
    uint32 beindex = 0;
    uint256 constant public ProposalGas = 50;
    uint256 constant public ProposalGift = 80;
    uint256 constant public Proposalvote = 30;
    string public constant name = "ERC_wqz";
    string public constant symbol = "WQZ";

    Proposal [] proposals; // A map from proposal index to proposal
    mapping(address => int) times; //Gift

    constructor() {
        // maybe you need a constructor
        studentERC20 = new MyERC20(name, symbol);
        Gift = new MyERC721();
    }

    function helloworld() pure external returns(string memory) {
        return "hello world";
    }

    function GiveAProposal(string memory _name, string memory _content) payable external{
        require(bytes(_content).length != 0 && bytes(_name).length != 0 , "Please complete your proposal");
        Proposal memory newPro;
        newPro.name = _name;
        newPro.content = _content;
        newPro.startTime = block.timestamp;
        newPro.duration = 5 minutes;
        newPro.index = index;
        newPro.proposer = msg.sender;
        proposals.push(newPro);
        index = index + 1;
        studentERC20.transferFrom(msg.sender, address(this), ProposalGas);
    }

    function GiveAnApproval(uint32 proposalIndex) payable external{
        require(proposals[proposalIndex].startTime + proposals[proposalIndex].duration > block.timestamp, "The proposal is terminated");
        require(answer[msg.sender][proposalIndex] == false, "One person can vote only once!");
        proposals[proposalIndex].approval++;
        answer[msg.sender][proposalIndex] = true;
        studentERC20.transferFrom(msg.sender, address(this), Proposalvote);
    }

    function GiveAnDisapproval(uint32 proposalIndex) payable external{
        require(proposals[proposalIndex].startTime + proposals[proposalIndex].duration > block.timestamp, "The proposal is terminated");
        require(answer[msg.sender][proposalIndex] == false, "One person can vote only once!");
        proposals[proposalIndex].disapproval++;
        answer[msg.sender][proposalIndex] = true;
        studentERC20.transferFrom(msg.sender, address(this), Proposalvote);
    }

    function GetHomeaddress() external view returns(address)
    {
        return address(this);
    }


    function Getindex() external view returns(uint) 
    {
        return index;
    }

    function GetBeindex() external view returns(uint) 
    {
        return beindex;
    }

    function EndOfProposal() payable external{
        for(uint i=beindex; i<index; i++)
        {
            if(proposals[i].startTime + proposals[i].duration <= block.timestamp)
            {
                beindex ++;
                if(proposals[i].disapproval < proposals[i].approval)
                {
                    studentERC20.transfer(proposals[i].proposer, ProposalGas);
                    times[msg.sender] ++;
                    if(times[msg.sender] == 3){
                        //Give a ERC721
                        Gift.awardItem(msg.sender);
                    }
                }
                studentERC20.transfer(msg.sender, ProposalGas/2);
            }
        }
    }

    function GetProposal() external view returns(ReProposal [] memory)
    {
        ReProposal[] memory Repro;
        Repro = new ReProposal[](index - beindex);
        for(uint i=beindex; i<index; i++)
        {
            Repro[i-beindex].index = proposals[i].index;
            Repro[i-beindex].name = proposals[i].name;
            Repro[i-beindex].content = proposals[i].content;
            Repro[i-beindex].approval = proposals[i].approval;
            Repro[i-beindex].disapproval = proposals[i].disapproval;
            Repro[i-beindex].proposer = proposals[i].proposer;
        }
        return Repro;
    }
    
    function GetApprove(uint32 proposalIndex) external view returns(uint256){
        return proposals[proposalIndex].approval;
    }

    function GetDisapprove(uint32 proposalIndex) external view returns(uint256){
        return proposals[proposalIndex].disapproval;
    }

    function GetHisProposal() external view returns(ReProposal [] memory)
    {
        ReProposal[] memory Repro;
        Repro = new ReProposal[](index);
        for(uint i=0; i<index; i++)
        {
            if(proposals[i].startTime + proposals[i].duration > block.timestamp)
            {
                Repro[i].approval = 9999999999;
                Repro[i].disapproval = 9999999999;
            }
            else{
                Repro[i].approval = proposals[i].approval;
                Repro[i].disapproval = proposals[i].disapproval;
            }
            Repro[i].index = proposals[i].index;
            Repro[i].name = proposals[i].name;
            Repro[i].content = proposals[i].content;
            Repro[i].proposer = proposals[i].proposer;
        }
        return Repro;
    }
}


contract MyERC20 is ERC20{
    uint256 total_Supply = 1000000;//初始分币量

    mapping(address => bool) claimedAirdropPlayerList;
    constructor(string memory name, string memory symbol) ERC20(name, symbol) {
        _mint(msg.sender, total_Supply);
    }
    function airdrop() external {
        require(claimedAirdropPlayerList[msg.sender] == false, "This user has claimed airdrop already");
        _mint(msg.sender, 1000);
        claimedAirdropPlayerList[msg.sender] = true;
    }
}

contract MyERC721 is ERC721URIStorage{
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    constructor() ERC721("Wqz", "Gift") {}

    function awardItem(address player) public returns (uint256){
        uint256 newItemId = _tokenIds.current();
        _mint(player, newItemId);
        _tokenIds.increment();
        return newItemId;
    }
}