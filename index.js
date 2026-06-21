const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const pino = require('pino');
const config = require('./config');
const { tanyaAI, resetChat } = require('./fitur/ai');

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState(config.sesiLogin);
    const sock = makeWASocket({
        auth: state,
        logger: pino({ level: 'silent' }),
        browser: ['Ubuntu', 'Chrome', '120.0'],
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

        const teks = msg.message.conversation ||
                     msg.message.extendedTextMessage?.text ||
                     msg.message.imageMessage?.caption || "";
        const id = msg.key.remoteJid;
        const cmd = teks.trim().toLowerCase();

        // Command: ping
        if (cmd === 'ping') {
            return sock.sendMessage(id, { text: '🏓 Pong! Bot aktif.' });
        }

        // Command: reset chat AI
        if (cmd === '!reset') {
            resetChat(id);
            return sock.sendMessage(id, { text: '🔄 Riwayat chat direset!' });
        }

        // Kirim semua pesan lain ke AI
        const balasan = await tanyaAI(id, teks);
        await sock.sendMessage(id, { text: balasan });
    });
}

startBot();
