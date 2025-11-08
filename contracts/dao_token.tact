// TONIX Token (TIX) - DAO Token Contract
// Total Supply: 10,000,000 TIX
// Decimals: 9

import "@stdlib/deploy";
import "@stdlib/ownable";

message Mint {
    to: Address;
    amount: Int as uint128;
}

message Transfer {
    to: Address;
    amount: Int as uint128;
}

message Burn {
    amount: Int as uint128;
}

contract TONIXToken with Deployable, Ownable {
    totalSupply: Int as uint128 = 0;
    decimals: Int as int8 = 9;
    maxSupply: Int as uint128 = 10000000 * 1000000000; // 10M * 10^9
    
    balances: map<Address, Int as uint128> = emptyMap();
    
    init(owner: Address) {
        Ownable.init(owner);
    }
    
    // Mint tokens (owner only)
    receive(msg: Mint) {
        self.onlyOwner();
        require(msg.amount > 0, "Amount must be positive");
        require(self.totalSupply + msg.amount <= self.maxSupply, "Exceeds max supply");
        
        self.totalSupply = self.totalSupply + msg.amount;
        let currentBalance = self.balances.get(msg.to, 0);
        self.balances.set(msg.to, currentBalance + msg.amount);
    }
    
    // Transfer tokens
    receive(msg: Transfer) {
        require(msg.amount > 0, "Amount must be positive");
        let sender = myAddress();
        let senderBalance = self.balances.get(sender, 0);
        require(senderBalance >= msg.amount, "Insufficient balance");
        
        self.balances.set(sender, senderBalance - msg.amount);
        let receiverBalance = self.balances.get(msg.to, 0);
        self.balances.set(msg.to, receiverBalance + msg.amount);
    }
    
    // Burn tokens
    receive(msg: Burn) {
        require(msg.amount > 0, "Amount must be positive");
        let sender = myAddress();
        let senderBalance = self.balances.get(sender, 0);
        require(senderBalance >= msg.amount, "Insufficient balance");
        
        self.balances.set(sender, senderBalance - msg.amount);
        self.totalSupply = self.totalSupply - msg.amount;
    }
    
    // Get balance
    get fun balance(owner: Address): Int as uint128 {
        return self.balances.get(owner, 0);
    }
    
    // Get vote power (1 token = 1 vote)
    get fun votePower(owner: Address): Int as uint128 {
        return self.balances.get(owner, 0);
    }
    
    // Get total supply
    get fun getTotalSupply(): Int as uint128 {
        return self.totalSupply;
    }
}

