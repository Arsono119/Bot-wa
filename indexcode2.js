const { default: makeWASocket, useMultiFileAuthState, delay, Browsers } = require('@whiskeysockets/baileys');
const pino = require('pino');
const { exec } = require('child_process');

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('sesi_login');
    const sock = makeWASocket({
        auth: state,
        logger: pino({ level: 'silent' }),
        browser: Browsers.ubuntu('Chrome'),
        syncFullHistory: false
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', ({ connection }) => {
        if (connection === 'close') startBot();
        else if (connection === 'open') console.log('\n🎉 BOT BERHASIL AKTIF!');
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

        // --- SAPAAN ---
        else if (['halo', 'hi', 'hey', 'hai', 'hello', 'p'].includes(cmd)) {
            await sock.sendMessage(id, { 
                text: `👋 Halo! Selamat datang!\nKetik *!menu* untuk melihat fitur yang tersedia.` 
            });
        }

        // --- MENU ---
        else if (cmd === '!menu') {
            await sock.sendMessage(id, { 
                text: `🤖 *MENU BOT* 🤖\n\n• *! 1* : Cek Waktu\n• *ping* : Cek Bot Aktif` 
            });
        }

        // --- CEK WAKTU ---
        else if (cmd === '! 1') {
            exec('bash menu.sh waktu', (err, stdout) => {
                sock.sendMessage(id, { text: stdout || 'Gagal mengambil waktu.' });
            });
        }
    });
}
startBot();