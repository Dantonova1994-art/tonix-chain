import "@stdlib/deploy";
import "@stdlib/ownable";
import "@stdlib/nft";

// NFT Ticket Contract
// Stores lottery ticket information as NFT

message Mint {
    owner: Address;
    round_id: Int;
    ticket_id: Int;
    buy_tx_hash: Slice;
}

message GetTicketInfo {
    $$query;
}

message TicketInfo {
    owner: Address;
    round_id: Int;
    ticket_id: Int;
    created_at: Int;
}

contract NftTicket with Deployable, Ownable {
    owner: Address;
    round_id: Int;
    ticket_id: Int;
    buy_tx_hash: Slice;
    created_at: Int;

    init(owner: Address, round_id: Int, ticket_id: Int, buy_tx_hash: Slice) {
        self.owner = owner;
        self.round_id = round_id;
        self.ticket_id = ticket_id;
        self.buy_tx_hash = buy_tx_hash;
        self.created_at = now();
    }

    receive(msg: Mint) {
        // Only owner (minter contract) can mint
        self.requireOwner();
        self.owner = msg.owner;
        self.round_id = msg.round_id;
        self.ticket_id = msg.ticket_id;
        self.buy_tx_hash = msg.buy_tx_hash;
        self.created_at = now();
    }

    get fun get_ticket_info(): TicketInfo {
        return TicketInfo{
            owner: self.owner,
            round_id: self.round_id,
            ticket_id: self.ticket_id,
            created_at: self.created_at
        };
    }
}

