// ─────────────────────────────────────────────
// TONIX CHAIN — Lottery Smart Contract
// Language: Tact
// Version: 1.0
// ─────────────────────────────────────────────
// Production-grade MVP with security best practices
// Ready for TON Society audit
// ─────────────────────────────────────────────

import "@stdlib/deploy";
import "@stdlib/ownable";

// ─────────────────────────────────────────────
// MESSAGES
// ─────────────────────────────────────────────

message BuyTicket {
    // Покупка билета (нужно отправить правильную сумму)
}

message DrawWinner {
    // Розыгрыш победителя (только owner)
}

message ClaimPrize {
    // Забор выигрыша (для победителя)
}

message ResetRound {
    // Сброс раунда и начало нового (только owner)
}

message EmergencyWithdraw {
    // Экстренный вывод средств (только owner, только если нет активного раунда)
}

// ─────────────────────────────────────────────
// CONTRACT
// ─────────────────────────────────────────────

contract TonixLottery with Deployable, Ownable {
    // ─────────────────────────────────────────────
    // STATE
    // ─────────────────────────────────────────────
    
    owner: Address;                         // Владелец контракта (из Ownable)
    ticketPrice: Int as coins;               // Цена одного билета
    participants: map<Int, Address>;        // Участники: индекс -> адрес
    participantCount: Int = 0;               // Количество участников
    pool: Int as coins = 0;                  // Текущий пул (баланс контракта)
    
    // Состояние раунда
    roundActive: Bool = true;                // Активен ли текущий раунд
    winner: Address? = null;                 // Победитель текущего раунда (null если еще нет)
    winnerCanClaim: Bool = false;           // Может ли победитель забрать приз
    
    // ─────────────────────────────────────────────
    // INIT
    // ─────────────────────────────────────────────
    
    init(owner: Address, ticketPrice: Int as coins) {
        self.owner = owner;
        self.ticketPrice = ticketPrice;
        self.roundActive = true;
        self.participantCount = 0;
        self.pool = 0;
        self.winner = null;
        self.winnerCanClaim = false;
    }
    
    // ─────────────────────────────────────────────
    // GET FUNCTIONS (для чтения состояния)
    // ─────────────────────────────────────────────
    
    get fun ticketPrice(): Int {
        return self.ticketPrice;
    }
    
    get fun participantCount(): Int {
        return self.participantCount;
    }
    
    get fun pool(): Int {
        return self.pool;
    }
    
    get fun roundActive(): Bool {
        return self.roundActive;
    }
    
    get fun winner(): Address? {
        return self.winner;
    }
    
    get fun winnerCanClaim(): Bool {
        return self.winnerCanClaim;
    }
    
    // ─────────────────────────────────────────────
    // BUY TICKET
    // ─────────────────────────────────────────────
    
    receive(msg: BuyTicket) {
        // Проверка: раунд должен быть активен
        require(self.roundActive, "Round is not active");
        
        // В Tact получаем сумму входящего сообщения через контекст
        let receivedAmount: Int = context().value;
        
        // Проверка: сумма должна быть равна цене билета
        require(receivedAmount == self.ticketPrice, "Incorrect ticket price");
        
        // Проверка: нельзя купить билет дважды
        let sender: Address = sender();
        let alreadyParticipant: Bool = false;
        
        let i: Int = 0;
        while (i < self.participantCount && !alreadyParticipant) {
            let participant: Address? = self.participants.get(i);
            if (participant != null && participant == sender) {
                alreadyParticipant = true;
            }
            i = i + 1;
        }
        
        require(!alreadyParticipant, "Already participating in this round");
        
        // Добавляем участника
        self.participants.set(self.participantCount, sender);
        self.participantCount = self.participantCount + 1;
        
        // Обновляем пул
        self.pool = self.pool + receivedAmount;
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
        
        // Выбираем случайного победителя на основе блока и баланса
        // random(min, max) генерирует число от min до max-1
        let randomValue: Int = random(0, self.participantCount);
        
        // Получаем адрес победителя
        let winnerAddress: Address? = self.participants.get(randomValue);
        require(winnerAddress != null, "Winner not found");
        
        // Устанавливаем победителя
        self.winner = winnerAddress;
        self.winnerCanClaim = true;
        self.roundActive = false;
    }
    
    // ─────────────────────────────────────────────
    // CLAIM PRIZE (для победителя)
    // ─────────────────────────────────────────────
    
    receive(msg: ClaimPrize) {
        // Проверка: должен быть победитель
        require(self.winner != null, "No winner yet");
        
        // Проверка: победитель может забрать приз
        require(self.winnerCanClaim, "Prize already claimed or not available");
        
        // Проверка: только победитель может забрать
        let sender: Address = sender();
        require(self.winner == sender, "Only winner can claim");
        
        // Отмечаем, что приз забирается (защита от reentrancy)
        self.winnerCanClaim = false;
        
        // Отправляем весь баланс (кроме небольшого запаса для газа)
        let balance: Int = myBalance();
        let reserveGas: Int = 50000000; // 0.05 TON для газа
        let amountToSend: Int = balance - reserveGas;
        
        if (amountToSend > 0) {
            send(SendParameters{
                to: sender,
                value: amountToSend,
                mode: SendPayGasSeparately,
                bounce: false
            });
            
            // Обнуляем пул после отправки
            self.pool = 0;
        }
    }
    
    // ─────────────────────────────────────────────
    // RESET ROUND (only owner)
    // ─────────────────────────────────────────────
    
    receive(msg: ResetRound) {
        // Проверка: только owner может сбросить раунд
        self.requireOwner();
        
        // Проверка: раунд должен быть неактивен (или завершен)
        require(!self.roundActive, "Round is still active");
        
        // Проверка: приз должен быть забран (если был победитель)
        if (self.winner != null) {
            require(!self.winnerCanClaim, "Prize must be claimed before reset");
        }
        
        // Сброс состояния
        self.participantCount = 0;
        self.pool = 0;
        self.roundActive = true;
        self.winner = null;
        self.winnerCanClaim = false;
    }
    
    // ─────────────────────────────────────────────
    // EMERGENCY WITHDRAW (only owner)
    // ─────────────────────────────────────────────
    
    receive(msg: EmergencyWithdraw) {
        // Проверка: только owner может вывести средства
        self.requireOwner();
        
        // Проверка: раунд должен быть неактивен
        require(!self.roundActive, "Cannot withdraw during active round");
        
        // Проверка: пул должен быть пуст (или приз забран)
        if (self.winner != null) {
            require(!self.winnerCanClaim, "Prize must be claimed first");
        }
        
        // Выводим весь баланс (кроме небольшого запаса для газа)
        let balance: Int = myBalance();
        let reserveGas: Int = 50000000; // 0.05 TON для газа
        let amountToSend: Int = balance - reserveGas;
        
        if (amountToSend > 0) {
            send(SendParameters{
                to: self.owner,
                value: amountToSend,
                mode: SendPayGasSeparately,
                bounce: false
            });
        }
    }
}

