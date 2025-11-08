// contracts/winner_collection.tact
// NFT Collection для победителей TON Battle

import "@stdlib/deploy";
import "@stdlib/ownable";
import "@stdlib/nft/collection";

contract WinnerCollection with Deployable, Ownable, NftCollection {
    owner: Address;
    next_item_index: Int;

    init(owner: Address) {
        self.owner = owner;
        self.next_item_index = 0;
    }

    // Минт NFT победителя
    message MintWinner {
        owner: Address;
        match_id: Int;
        tx_hash: Slice;
    }

    receive(msg: MintWinner) {
        require(sender() == self.owner, "Only owner can mint");
        
        let item_index = self.next_item_index;
        self.next_item_index = self.next_item_index + 1;
        
        // Создаём NFT item
        // В реальной реализации здесь будет создание NFT item контракта
    }

    // Getter: получить информацию о NFT
    get fun get_item_info(item_id: Int): (Address, Int, Slice) {
        // В реальной реализации здесь будет чтение из item контракта
        return (emptyAddress(), 0, emptySlice());
    }
}

