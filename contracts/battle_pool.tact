// contracts/battle_pool.tact
// TON Battle Pool - MVP с owner-resolve
// TODO: Upgrade на commit-reveal (hash(commit), reveal(secret)) и fair oracle

import "@stdlib/deploy";
import "@stdlib/ownable";

contract BattlePool with Deployable, Ownable {
    owner: Address;
    entry_value: Int; // В nanotons
    pot: Int; // Накопленная сумма
    current_match_id: Int;
    matches: map<Int, (Address, Address, Address?, Bool)>; // match_id => (p1, p2, winner?, resolved?)

    init(owner: Address, entry_value: Int) {
        self.owner = owner;
        self.entry_value = entry_value;
        self.pot = 0;
        self.current_match_id = 0;
    }

    // External: присоединиться к матчу
    receive(msg: slice) {
        let value = myBalance() - self.pot;
        require(value == self.entry_value, "Invalid entry value");
        
        self.pot = self.pot + value;
        self.current_match_id = self.current_match_id + 1;
        
        let match_data = self.matches.get(self.current_match_id);
        if (match_data == null) {
            // Первый игрок
            self.matches.set(self.current_match_id, (sender(), emptyAddress(), emptyAddress(), false));
        } else {
            // Второй игрок - матч закрыт
            let (p1, p2, winner, resolved) = match_data;
            require(p2 == emptyAddress(), "Match already full");
            self.matches.set(self.current_match_id, (p1, sender(), emptyAddress(), false));
        }
    }

    // External: resolve матча (только owner)
    message Resolve {
        match_id: Int;
        winner_addr: Address;
    }

    receive(msg: Resolve) {
        require(sender() == self.owner, "Only owner can resolve");
        
        let match_data = self.matches.get(msg.match_id);
        require(match_data != null, "Match not found");
        
        let (p1, p2, winner, resolved) = match_data;
        require(!resolved, "Match already resolved");
        require(msg.winner_addr == p1 || msg.winner_addr == p2, "Winner must be a player");
        
        self.matches.set(msg.match_id, (p1, p2, msg.winner_addr, true));
        
        // Выплата победителю (весь банк матча минус storage fee)
        let payout = self.entry_value * 2 - 10000000; // 0.01 TON на storage
        send(SendParameters{
            to: msg.winner_addr,
            value: payout,
            mode: SendRemainingValue,
            body: empty(),
        });
        
        self.pot = self.pot - (self.entry_value * 2);
    }

    // Getter: получить информацию о матче
    get fun get_match(match_id: Int): (Address, Address, Address?, Bool) {
        let match_data = self.matches.get(match_id);
        if (match_data == null) {
            return (emptyAddress(), emptyAddress(), emptyAddress(), false);
        }
        return match_data;
    }

    // Getter: получить entry_value
    get fun get_entry_value(): Int {
        return self.entry_value;
    }

    // Getter: получить текущий pot
    get fun get_pot(): Int {
        return self.pot;
    }
}

