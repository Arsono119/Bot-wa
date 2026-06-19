const { default: makeWASocket, useMultiFileAuthState, Browsers } = require('@whiskeysockets/baileys');
const pino = require('pino');
const config = require('./config');
const { kataSapaan, sapaan } = require('./fitur/sapaan');
const { menu } = require('./fitur/menu');
const { waktu } = require('./fitur/waktu');

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

        if (cmd === 'ping') {
            await sock.sendMessage(id, { text: '🏓 Pong! Bot aktif.' });
        }
        else if (kataSapaan.includes(cmd)) {
            await sapaan(sock, id);
        }
        else if (cmd === '!menu') {
            await menu(sock, id);
        }
        else if (cmd === '! 1') {
            await waktu(sock, id);
        }
    });
}
startBot();