// ─────────────────────────────────────────────
// TONIX CHAIN — LotteryCore v2
// Language: Tact
// Version: 2.0
// ─────────────────────────────────────────────
// Isolated Vault logic and DAO hooks
// ─────────────────────────────────────────────

import "@stdlib/deploy";
import "@stdlib/ownable";

// ─────────────────────────────────────────────
// MESSAGES
// ─────────────────────────────────────────────

message BuyTicket {
    // Покупка билета
}

message CommitSeed {
    seedHash: Int; // Хеш сида для commit-reveal схемы
}

message RevealSeed {
    seed: Int; // Раскрытый сид
}

message SetParams {
    feePercent: Int; // Процент комиссии (0-100)
    vaultAddress: Address; // Адрес Vault контракта
}

message DrawWinner {
    // Розыгрыш победителя (только owner)
}

message ResetRound {
    // Сброс раунда и начало нового (только owner)
}

// ─────────────────────────────────────────────
// CONTRACT
// ─────────────────────────────────────────────

contract LotteryCore with Deployable, Ownable {
    // ─────────────────────────────────────────────
    // STATE
    // ─────────────────────────────────────────────
    
    owner: Address;                         // Владелец контракта (из Ownable)
    vaultAddress: Address?;                 // Адрес Vault контракта
    daoAddress: Address?;                   // Адрес DAO для управления параметрами
    feePercent: Int = 5;                    // Процент комиссии (по умолчанию 5%)
    roundId: Int = 0;                       // ID текущего раунда
    
    // Участники и билеты
    participants: map<Int, Address>;        // Участники: индекс -> адрес
    participantCount: Int = 0;              // Количество участников
    tickets: map<Address, Int>;             // Билеты: адрес -> количество
    
    // Commit-reveal схема для случайности
    commitHash: Int?;                       // Хеш закоммиченного сида
    revealedSeed: Int?;                     // Раскрытый сид
    
    // Состояние раунда
    roundActive: Bool = true;               // Активен ли текущий раунд
    winner: Address?;                        // Победитель текущего раунда
    winnerCanClaim: Bool = false;            // Может ли победитель забрать приз
    
    // ─────────────────────────────────────────────
    // INIT
    // ─────────────────────────────────────────────
    
    init(owner: Address, vaultAddress: Address?, daoAddress: Address?) {
        self.owner = owner;
        self.vaultAddress = vaultAddress;
        self.daoAddress = daoAddress;
        self.feePercent = 5;
        self.roundId = 0;
        self.roundActive = true;
        self.participantCount = 0;
        self.winner = null;
        self.winnerCanClaim = false;
        self.commitHash = null;
        self.revealedSeed = null;
    }
    
    // ─────────────────────────────────────────────
    // GET FUNCTIONS
    // ─────────────────────────────────────────────
    
    get fun getVaultAddress(): Address? {
        return self.vaultAddress;
    }
    
    get fun getDaoAddress(): Address? {
        return self.daoAddress;
    }
    
    get fun getFeePercent(): Int {
        return self.feePercent;
    }
    
    get fun getRoundId(): Int {
        return self.roundId;
    }
    
    get fun getParticipantCount(): Int {
        return self.participantCount;
    }
    
    get fun getTickets(address: Address): Int {
        let tickets: Int? = self.tickets.get(address);
        if (tickets == null) {
            return 0;
        }
        return tickets;
    }
    
    // ─────────────────────────────────────────────
    // BUY TICKET
    // ─────────────────────────────────────────────
    
    receive(msg: BuyTicket) {
        // Проверка: раунд должен быть активен
        require(self.roundActive, "Round is not active");
        
        // Проверка: Vault должен быть установлен
        require(self.vaultAddress != null, "Vault not configured");
        
        let vaultOpt: Address? = self.vaultAddress;
        let vault: Address = vaultOpt!!;
        let receivedAmount: Int = context().value;
        
        // Проверка: сумма должна быть больше нуля
        require(receivedAmount > 0, "No TON sent");
        
        let sender: Address = sender();
        
        // Добавляем участника, если его еще нет
        let alreadyParticipant: Bool = false;
        let i: Int = 0;
        while (i < self.participantCount && !alreadyParticipant) {
            let participant: Address? = self.participants.get(i);
            if (participant != null && participant == sender) {
                alreadyParticipant = true;
            }
            i = i + 1;
        }
        
        if (!alreadyParticipant) {
            self.participants.set(self.participantCount, sender);
            self.participantCount = self.participantCount + 1;
        }
        
        // Обновляем количество билетов
        let currentTicketsOpt: Int? = self.tickets.get(sender);
        let currentTickets: Int;
        if (currentTicketsOpt == null) {
            currentTickets = 0;
        } else {
            currentTickets = currentTicketsOpt!!;
        }
        self.tickets.set(sender, currentTickets + receivedAmount);
        
        // Отправляем средства в Vault
        send(SendParameters{
            to: vault,
            value: receivedAmount,
            mode: SendPayGasSeparately,
            bounce: false
        });
    }
    
    // ─────────────────────────────────────────────
    // COMMIT SEED (для commit-reveal схемы)
    // ─────────────────────────────────────────────
    
    receive(msg: CommitSeed) {
        // Только owner может закоммитить сид
        self.requireOwner();
        
        require(self.commitHash == null, "Seed already committed");
        self.commitHash = msg.seedHash;
    }
    
    // ─────────────────────────────────────────────
    // REVEAL SEED (раскрытие сида)
    // ─────────────────────────────────────────────
    
    receive(msg: RevealSeed) {
        // Только owner может раскрыть сид
        self.requireOwner();
        
        require(self.commitHash != null, "No seed committed");
        require(self.revealedSeed == null, "Seed already revealed");
        
        // Проверка хеша (упрощенная версия)
        // В реальности нужно использовать правильную хеш-функцию
        let seedHash: Int = msg.seed;
        require(seedHash == self.commitHash, "Invalid seed");
        
        self.revealedSeed = msg.seed;
    }
    
    // ─────────────────────────────────────────────
    // DRAW WINNER (only owner)
    // ─────────────────────────────────────────────
    
    receive(msg: DrawWinner) {
        // Проверка: только owner может запустить розыгрыш
        self.requireOwner();
        
        // Проверка: раунд должен быть активен
        require(self.roundActive, "Round is not active");
        
        // Проверка: должен быть хотя бы один участник
        require(self.participantCount > 0, "No participants");
        
        // Выбираем случайного победителя
        // Используем revealedSeed если доступен, иначе random
        let randomValue: Int;
        if (self.revealedSeed != null) {
            randomValue = (self.revealedSeed!! + self.roundId) % self.participantCount;
        } else {
            randomValue = random(0, self.participantCount);
        }
        
        // Получаем адрес победителя
        let winnerAddress: Address? = self.participants.get(randomValue);
        require(winnerAddress != null, "Winner not found");
        
        // Устанавливаем победителя
        self.winner = winnerAddress;
        self.winnerCanClaim = true;
        self.roundActive = false;
    }
    
    // ─────────────────────────────────────────────
    // SET PARAMS (только DAO)
    // ─────────────────────────────────────────────
    
    receive(msg: SetParams) {
        // Проверка: только DAO может устанавливать параметры
        require(self.daoAddress != null, "DAO not configured");
        require(sender() == self.daoAddress, "Not authorized");
        
        // Проверка: процент комиссии должен быть от 0 до 100
        require(msg.feePercent >= 0 && msg.feePercent <= 100, "Invalid fee percent");
        
        self.feePercent = msg.feePercent;
        self.vaultAddress = msg.vaultAddress;
    }
    
    // ─────────────────────────────────────────────
    // RESET ROUND (only owner)
    // ─────────────────────────────────────────────
    
    receive(msg: ResetRound) {
        // Проверка: только owner может сбросить раунд
        self.requireOwner();
        
        // Проверка: раунд должен быть неактивен
        require(!self.roundActive, "Round is still active");
        
        // Проверка: приз должен быть забран
        if (self.winner != null) {
            require(!self.winnerCanClaim, "Prize must be claimed before reset");
        }
        
        // Сброс состояния
        self.roundId = self.roundId + 1;
        self.roundActive = true;
        self.participantCount = 0;
        self.winner = null;
        self.winnerCanClaim = false;
        self.commitHash = null;
        self.revealedSeed = null;
    }
}
