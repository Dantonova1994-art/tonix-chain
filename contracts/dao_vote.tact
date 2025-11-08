// TONIX DAO Voting Contract

import "@stdlib/deploy";
import "@stdlib/ownable";

struct Proposal {
    id: Int as uint64;
    title: String;
    description: String;
    options: map<String, Int as uint128>; // option -> vote count
    creator: Address;
    deadline: Int as uint64;
    totalVotes: Int as uint128;
}

message CreateProposal {
    title: String;
    description: String;
    options: String[]; // Array of option strings
    deadline: Int as uint64; // Unix timestamp
}

message Vote {
    proposalId: Int as uint64;
    option: String;
}

contract TONIXDAO with Deployable, Ownable {
    proposals: map<Int as uint64, Proposal> = emptyMap();
    votes: map<Int as uint64, map<Address, String>> = emptyMap(); // proposalId -> (voter -> option)
    nextProposalId: Int as uint64 = 1;
    tokenContract: Address? = null;
    
    init(owner: Address) {
        Ownable.init(owner);
    }
    
    // Set token contract address
    receive(msg: SetTokenContract) {
        self.onlyOwner();
        self.tokenContract = msg.address;
    }
    
    // Create proposal
    receive(msg: CreateProposal) {
        require(msg.options.length() > 0, "Must have at least one option");
        require(msg.deadline > now(), "Deadline must be in the future");
        
        let optionsMap: map<String, Int as uint128> = emptyMap();
        let i = 0;
        while (i < msg.options.length()) {
            optionsMap.set(msg.options.at(i), 0);
            i = i + 1;
        }
        
        let proposal = Proposal{
            id: self.nextProposalId,
            title: msg.title,
            description: msg.description,
            options: optionsMap,
            creator: myAddress(),
            deadline: msg.deadline,
            totalVotes: 0
        };
        
        self.proposals.set(self.nextProposalId, proposal);
        self.nextProposalId = self.nextProposalId + 1;
    }
    
    // Vote on proposal
    receive(msg: Vote) {
        let proposal = self.proposals.get(msg.proposalId);
        require(proposal != null, "Proposal not found");
        require(now() < proposal.deadline, "Proposal deadline passed");
        
        // Check if already voted
        let proposalVotes = self.votes.get(msg.proposalId, emptyMap());
        require(proposalVotes.get(myAddress()) == null, "Already voted");
        
        // Check if option exists
        require(proposal.options.get(msg.option) != null, "Invalid option");
        
        // Increment vote count
        let currentVotes = proposal.options.get(msg.option, 0);
        proposal.options.set(msg.option, currentVotes + 1);
        proposal.totalVotes = proposal.totalVotes + 1;
        
        // Record vote
        proposalVotes.set(myAddress(), msg.option);
        self.votes.set(msg.proposalId, proposalVotes);
        self.proposals.set(msg.proposalId, proposal);
    }
    
    // Get proposal
    get fun getProposal(id: Int as uint64): Proposal? {
        return self.proposals.get(id);
    }
    
    // Get vote results
    get fun getResults(id: Int as uint64): map<String, Int as uint128>? {
        let proposal = self.proposals.get(id);
        if (proposal == null) {
            return null;
        }
        return proposal.options;
    }
    
    // Get all active proposals
    get fun getActiveProposals(): Proposal[] {
        let active: Proposal[] = [];
        let i = 1;
        while (i < self.nextProposalId) {
            let proposal = self.proposals.get(i);
            if (proposal != null && now() < proposal.deadline) {
                active.push(proposal);
            }
            i = i + 1;
        }
        return active;
    }
}

message SetTokenContract {
    address: Address;
}

