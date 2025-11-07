// ─────────────────────────────────────────────
// TONIX CHAIN — Vault Contract
// Language: Tact
// Version: 1.0
// ─────────────────────────────────────────────
// Isolated vault for ticket deposits
// ─────────────────────────────────────────────

import "@stdlib/deploy";
import "@stdlib/ownable";

// ─────────────────────────────────────────────
// MESSAGES
// ─────────────────────────────────────────────

message DepositTicket {
    // Депозит билета (вызывается из LotteryCore)
}

message Withdraw {
    // Вывод средств пользователем
}

message TransferToWinner {
    winner: Address; // Адрес победителя
    amount: Int as coins; // Сумма для перевода
}

// ─────────────────────────────────────────────
// CONTRACT
// ─────────────────────────────────────────────

contract Vault with Deployable, Ownable {
    // ─────────────────────────────────────────────
    // STATE
    // ─────────────────────────────────────────────
    
    owner: Address;                         // Владелец контракта
    lotteryCoreAddress: Address?;          // Адрес LotteryCore контракта
    balances: map<Address, Int>;            // Балансы пользователей: адрес -> сумма
    
    // ─────────────────────────────────────────────
    // INIT
    // ─────────────────────────────────────────────
    
    init(owner: Address, lotteryCoreAddress: Address?) {
        self.owner = owner;
        self.lotteryCoreAddress = lotteryCoreAddress;
    }
    
    // ─────────────────────────────────────────────
    // GET FUNCTIONS
    // ─────────────────────────────────────────────
    
    get fun getBalance(userAddress: Address): Int {
        let balance: Int? = self.balances.get(userAddress);
        if (balance == null) {
            return 0;
        }
        return balance!!;
    }
    
    get fun getLotteryCoreAddress(): Address? {
        return self.lotteryCoreAddress;
    }
    
    // ─────────────────────────────────────────────
    // DEPOSIT TICKET (вызывается из LotteryCore)
    // ─────────────────────────────────────────────
    
    receive(msg: DepositTicket) {
        // Проверка: только LotteryCore может делать депозиты
        if (self.lotteryCoreAddress != null) {
            let coreAddress: Address = self.lotteryCoreAddress!!;
            require(sender() == coreAddress, "Only LotteryCore can deposit");
        }
        
        let from: Address = sender();
        let amount: Int = context().value;
        
        require(amount > 0, "No TON sent");
        
        // Обновляем баланс
        let currentBalanceOpt: Int? = self.balances.get(from);
        let currentBalance: Int;
        if (currentBalanceOpt == null) {
            currentBalance = 0;
        } else {
            currentBalance = currentBalanceOpt!!;
        }
        self.balances.set(from, currentBalance + amount);
    }
    
    // ─────────────────────────────────────────────
    // WITHDRAW (вывод средств пользователем)
    // ─────────────────────────────────────────────
    
    receive(msg: Withdraw) {
        let to: Address = sender();
        let balanceOpt: Int? = self.balances.get(to);
        let balance: Int;
        if (balanceOpt == null) {
            balance = 0;
        } else {
            balance = balanceOpt!!;
        }
        
        require(balance > 0, "Nothing to withdraw");
        
        // Обнуляем баланс перед отправкой
        self.balances.set(to, 0);
        
        // Отправляем средства
        send(SendParameters{
            to: to,
            value: balance,
            mode: SendPayGasSeparately,
            bounce: false
        });
    }
    
    // ─────────────────────────────────────────────
    // TRANSFER TO WINNER (только owner или LotteryCore)
    // ─────────────────────────────────────────────
    
    receive(msg: TransferToWinner) {
        // Проверка: только owner или LotteryCore может переводить средства
        let authorized: Bool = false;
        
        if (sender() == self.owner) {
            authorized = true;
        }
        
        if (self.lotteryCoreAddress != null && sender() == self.lotteryCoreAddress) {
            authorized = true;
        }
        
        require(authorized, "Not authorized");
        
        require(msg.amount > 0, "Invalid amount");
        
        // Проверяем баланс контракта
        let contractBalance: Int = myBalance();
        require(contractBalance >= msg.amount, "Insufficient balance");
        
        // Отправляем средства победителю
        send(SendParameters{
            to: msg.winner,
            value: msg.amount,
            mode: SendPayGasSeparately,
            bounce: false
        });
    }
    
    // ─────────────────────────────────────────────
    // SET LOTTERY CORE ADDRESS (только owner)
    // ─────────────────────────────────────────────
    
    receive(msg: SetLotteryCoreAddress) {
        self.requireOwner();
        self.lotteryCoreAddress = msg.address;
    }
}

message SetLotteryCoreAddress {
    address: Address;
}


