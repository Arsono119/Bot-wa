const { default: makeWASocket, useMultiFileAuthState, Browsers } = require('@whiskeysockets/baileys');
const pino = require('pino');
const config = require('./config');
const { menu } = require('./handler/menu');
const { waktu } = require('./handler/waktu');
const { tanyaAI, resetChat } = require('./fitur/ai');
const { catatKeuangan, ringkasanKeuangan } = require('./handler/keuangan');

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState(config.sesiLogin);
    const sock = makeWASocket({
        auth: state,
        logger: pino({ level: 'silent' }),
        browser: Browsers.ubuntu('Chrome'),
        syncFullHistory: false
    });
    
    sock.ev.on('creds.update', saveCreds);
    
    sock.ev.on('connection.update', ({ connection }) => {
        if (connection === 'close') startBot();
        else if (connection === 'open') console.log(config.pesanAktif);
    });
    
    sock.ev.on('messages.upsert', async (m) => {
        const msg = m.messages[0];
        if (!msg.message || msg.key.fromMe) return;
        
        const teks = msg.message.conversation || msg.message.extendedTextMessage?.text || "";
        const id = msg.key.remoteJid;
        const cmd = teks.trim().toLowerCase();
        
        // --- PING ---
        if (cmd === 'ping') {
            await sock.sendMessage(id, { text: '🏓 Pong! Bot aktif.' });
        }
        // --- MENU ---
        else if (cmd === '!menu') {
            await menu(sock, id);
        }
        // --- WAKTU ---
        else if (cmd === '! 1') {
            await waktu(sock, id);
        }
        // --- SALDO ---
        else if (cmd === '!saldo') {
            const ringkasan = ringkasanKeuangan(id);
            await sock.sendMessage(id, { text: ringkasan });
        }
        // --- RESET CHAT AI ---
        else if (cmd === '!reset') {
            resetChat(id);
            await sock.sendMessage(id, { text: '🔄 Chat AI direset!' });
        }
        // --- SEMUA PESAN KE AI ---
        else {
            const balasan = await tanyaAI(id, teks);
            
            const catatMatch = balasan.match(/\[CATAT:(\{.*?\})\]/s);
            const pesanBersih = balasan.replace(/\[CATAT:\{.*?\}\]/s, '').trim();
            
            if (catatMatch) {
                try {
                    const data = JSON.parse(catatMatch[1]);
                    const hasil = catatKeuangan(id, data.tipe, data.jumlah, data.keterangan);
                    await sock.sendMessage(id, { text: `${pesanBersih}\n\n${hasil}` });
                } catch (e) {
                    await sock.sendMessage(id, { text: pesanBersih });
                }
            } else {
                await sock.sendMessage(id, { text: pesanBersih });
            }
        }
    });
}
startBot();