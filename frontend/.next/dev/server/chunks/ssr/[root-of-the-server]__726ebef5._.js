module.exports = [
"[externals]/@tonconnect/ui [external] (@tonconnect/ui, esm_import)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

const mod = await __turbopack_context__.y("@tonconnect/ui");

__turbopack_context__.n(mod);
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, true);}),
"[externals]/@ton/core [external] (@ton/core, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("@ton/core", () => require("@ton/core"));

module.exports = mod;
}),
"[project]/src/styles/Home.module.css [ssr] (css module)", ((__turbopack_context__) => {

__turbopack_context__.v({
  "address": "Home-module__Ho9lYW__address",
  "button": "Home-module__Ho9lYW__button",
  "buttonSecondary": "Home-module__Ho9lYW__buttonSecondary",
  "card": "Home-module__Ho9lYW__card",
  "container": "Home-module__Ho9lYW__container",
  "info": "Home-module__Ho9lYW__info",
  "link": "Home-module__Ho9lYW__link",
  "status": "Home-module__Ho9lYW__status",
  "subtitle": "Home-module__Ho9lYW__subtitle",
  "title": "Home-module__Ho9lYW__title",
  "walletInfo": "Home-module__Ho9lYW__walletInfo",
});
}),
"[project]/src/pages/index.tsx [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "default",
    ()=>Home
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react/jsx-dev-runtime [external] (react/jsx-dev-runtime, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react [external] (react, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f40$tonconnect$2f$ui__$5b$external$5d$__$2840$tonconnect$2f$ui$2c$__esm_import$29$__ = __turbopack_context__.i("[externals]/@tonconnect/ui [external] (@tonconnect/ui, esm_import)");
var __TURBOPACK__imported__module__$5b$externals$5d2f40$ton$2f$core__$5b$external$5d$__$2840$ton$2f$core$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/@ton/core [external] (@ton/core, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$styles$2f$Home$2e$module$2e$css__$5b$ssr$5d$__$28$css__module$29$__ = __turbopack_context__.i("[project]/src/styles/Home.module.css [ssr] (css module)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$externals$5d2f40$tonconnect$2f$ui__$5b$external$5d$__$2840$tonconnect$2f$ui$2c$__esm_import$29$__
]);
[__TURBOPACK__imported__module__$5b$externals$5d2f40$tonconnect$2f$ui__$5b$external$5d$__$2840$tonconnect$2f$ui$2c$__esm_import$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
;
function Home() {
    const [connector, setConnector] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(null);
    const [wallet, setWallet] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(null);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(null);
    const [status, setStatus] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])('');
    // Получаем адрес контракта из переменных окружения
    const contract = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "EQBtB8vIHgdO49Ih02Yt9kD5tDKxOTrFgZHkRkAjFTrvJziT";
    // Opcodes из контракта
    const OP_BUY_TICKET = 3031985754; // BuyTicket
    const OP_DRAW_WINNER = 2838117625; // DrawWinner
    const OP_CLAIM_PRIZE = 2639554183; // ClaimPrize
    // Суммы для транзакций
    const TICKET_PRICE = "1000000000"; // 1 TON в nanotons
    const GAS_AMOUNT = "10000000"; // 0.01 TON для газа (DrawWinner, ClaimPrize)
    (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useEffect"])(()=>{
        const tonConnectUI = new __TURBOPACK__imported__module__$5b$externals$5d2f40$tonconnect$2f$ui__$5b$external$5d$__$2840$tonconnect$2f$ui$2c$__esm_import$29$__["TonConnectUI"]({
            manifestUrl: ("TURBOPACK compile-time falsy", 0) ? "TURBOPACK unreachable" : '/tonconnect-manifest.json'
        });
        setConnector(tonConnectUI);
        // Проверяем существующее подключение
        tonConnectUI.connectionRestored.then(()=>{
            if (tonConnectUI.wallet) {
                setWallet(tonConnectUI.wallet.account.address);
            }
        });
        tonConnectUI.onStatusChange((walletInfo)=>{
            if (walletInfo) {
                setWallet(walletInfo.account.address);
            } else {
                setWallet(null);
                setStatus('');
            }
        });
    }, []);
    const sendTx = async (opcode, amount, label)=>{
        if (!connector || !wallet) {
            setStatus('❌ Сначала подключите кошелёк');
            return;
        }
        setLoading(label);
        setStatus(`⏳ Выполняется: ${label}...`);
        try {
            // Создаём payload с opcode
            const cell = (0, __TURBOPACK__imported__module__$5b$externals$5d2f40$ton$2f$core__$5b$external$5d$__$2840$ton$2f$core$2c$__cjs$29$__["beginCell"])().storeUint(opcode, 32).endCell();
            const payload = cell.toBoc().toString('base64');
            await connector.sendTransaction({
                validUntil: Math.floor(Date.now() / 1000) + 300,
                messages: [
                    {
                        address: contract,
                        amount: amount,
                        payload: payload
                    }
                ]
            });
            setStatus(`✅ ${label} успешно выполнено!`);
        } catch (err) {
            console.error('Transaction error:', err);
            if (err.message && err.message.includes('User rejected')) {
                setStatus('❌ Транзакция отменена пользователем');
            } else {
                setStatus(`❌ Ошибка при выполнении ${label}: ${err.message || String(err)}`);
            }
        } finally{
            setLoading(null);
        }
    };
    const handleBuy = ()=>sendTx(OP_BUY_TICKET, TICKET_PRICE, 'Покупка билета');
    const handleDraw = ()=>sendTx(OP_DRAW_WINNER, GAS_AMOUNT, 'Розыгрыш');
    const handleClaim = ()=>sendTx(OP_CLAIM_PRIZE, GAS_AMOUNT, 'Получение приза');
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("main", {
        className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$styles$2f$Home$2e$module$2e$css__$5b$ssr$5d$__$28$css__module$29$__["default"].container,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h1", {
                className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$styles$2f$Home$2e$module$2e$css__$5b$ssr$5d$__$28$css__module$29$__["default"].title,
                children: "TONIX CHAIN 💎"
            }, void 0, false, {
                fileName: "[project]/src/pages/index.tsx",
                lineNumber: 91,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$styles$2f$Home$2e$module$2e$css__$5b$ssr$5d$__$28$css__module$29$__["default"].subtitle,
                children: "Лотерея будущего на TON (Mainnet)"
            }, void 0, false, {
                fileName: "[project]/src/pages/index.tsx",
                lineNumber: 92,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$styles$2f$Home$2e$module$2e$css__$5b$ssr$5d$__$28$css__module$29$__["default"].card,
                children: wallet ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["Fragment"], {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                            className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$styles$2f$Home$2e$module$2e$css__$5b$ssr$5d$__$28$css__module$29$__["default"].walletInfo,
                            children: "✅ Подключён:"
                        }, void 0, false, {
                            fileName: "[project]/src/pages/index.tsx",
                            lineNumber: 97,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                            className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$styles$2f$Home$2e$module$2e$css__$5b$ssr$5d$__$28$css__module$29$__["default"].address,
                            children: [
                                wallet.slice(0, 6),
                                "...",
                                wallet.slice(-6)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/pages/index.tsx",
                            lineNumber: 98,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                            onClick: handleBuy,
                            className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$styles$2f$Home$2e$module$2e$css__$5b$ssr$5d$__$28$css__module$29$__["default"].button,
                            disabled: loading !== null,
                            children: loading === 'Покупка билета' ? '⏳ Отправка...' : '🎟 Купить билет (1 TON)'
                        }, void 0, false, {
                            fileName: "[project]/src/pages/index.tsx",
                            lineNumber: 100,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                            onClick: handleDraw,
                            className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$styles$2f$Home$2e$module$2e$css__$5b$ssr$5d$__$28$css__module$29$__["default"].button,
                            disabled: loading !== null,
                            children: loading === 'Розыгрыш' ? '⏳ Отправка...' : '🎰 Провести розыгрыш (только owner)'
                        }, void 0, false, {
                            fileName: "[project]/src/pages/index.tsx",
                            lineNumber: 108,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                            onClick: handleClaim,
                            className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$styles$2f$Home$2e$module$2e$css__$5b$ssr$5d$__$28$css__module$29$__["default"].button,
                            disabled: loading !== null,
                            children: loading === 'Получение приза' ? '⏳ Отправка...' : '💰 Получить приз (только winner)'
                        }, void 0, false, {
                            fileName: "[project]/src/pages/index.tsx",
                            lineNumber: 116,
                            columnNumber: 13
                        }, this),
                        status && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                            className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$styles$2f$Home$2e$module$2e$css__$5b$ssr$5d$__$28$css__module$29$__["default"].status,
                            children: status
                        }, void 0, false, {
                            fileName: "[project]/src/pages/index.tsx",
                            lineNumber: 125,
                            columnNumber: 15
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                            onClick: ()=>connector?.disconnect(),
                            className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$styles$2f$Home$2e$module$2e$css__$5b$ssr$5d$__$28$css__module$29$__["default"].buttonSecondary,
                            children: "Отключить кошелёк"
                        }, void 0, false, {
                            fileName: "[project]/src/pages/index.tsx",
                            lineNumber: 128,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["Fragment"], {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                            onClick: ()=>connector?.connectWallet(),
                            className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$styles$2f$Home$2e$module$2e$css__$5b$ssr$5d$__$28$css__module$29$__["default"].button,
                            children: "🔗 Подключить кошелёк"
                        }, void 0, false, {
                            fileName: "[project]/src/pages/index.tsx",
                            lineNumber: 137,
                            columnNumber: 13
                        }, this),
                        status && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                            className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$styles$2f$Home$2e$module$2e$css__$5b$ssr$5d$__$28$css__module$29$__["default"].status,
                            children: status
                        }, void 0, false, {
                            fileName: "[project]/src/pages/index.tsx",
                            lineNumber: 144,
                            columnNumber: 15
                        }, this)
                    ]
                }, void 0, true)
            }, void 0, false, {
                fileName: "[project]/src/pages/index.tsx",
                lineNumber: 94,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$styles$2f$Home$2e$module$2e$css__$5b$ssr$5d$__$28$css__module$29$__["default"].info,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                        children: [
                            "📍 Контракт: ",
                            contract.slice(0, 8),
                            "...",
                            contract.slice(-8)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/pages/index.tsx",
                        lineNumber: 151,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("a", {
                        href: `https://tonviewer.com/${contract}`,
                        target: "_blank",
                        rel: "noopener noreferrer",
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$styles$2f$Home$2e$module$2e$css__$5b$ssr$5d$__$28$css__module$29$__["default"].link,
                        children: "🔍 Посмотреть на TonViewer"
                    }, void 0, false, {
                        fileName: "[project]/src/pages/index.tsx",
                        lineNumber: 152,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/pages/index.tsx",
                lineNumber: 150,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/pages/index.tsx",
        lineNumber: 90,
        columnNumber: 5
    }, this);
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__726ebef5._.js.map