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

        // --- SISTEM RESPON FAQS & COMMAND ---
        if (cmd === 'ping') {
            await sock.sendMessage(id, { text: 'pong! Bot aktif.' });
        } 
        else if (cmd === 'halo' || cmd === 'p') {
            await sock.sendMessage(id, { text: 'Halo! Ketik *!menu* untuk melihat fitur.' });
        } 
        else if (cmd === '!menu') {
            await sock.sendMessage(id, { text: `🤖 *MENU BOT* 🤖\n\n• *!fitur 1* : Cek Waktu\n• *!fitur 2* : Cek Internet Speed\n• *!fitur 3* : Kalkulator` });
        }
        // --- JALANKAN MENU.SH SECARA OTOMATIS ---
        else if (cmd === '!fitur 1') {
            exec('bash menu.sh waktu', (err, stdout) => sock.sendMessage(id, { text: stdout || 'Gagal mengambil waktu.' }));
        }
        else if (cmd === '!fitur 2') {
            await sock.sendMessage(id, { text: '⏳ Menjalankan Speedtest...' });
            exec('bash menu.sh speed', (err, stdout) => sock.sendMessage(id, { text: stdout || 'Gagal menjalankan speedtest.' }));
        }
        else if (cmd === '!fitur 3') {
            exec('bash menu.sh kalkulator', (err, stdout) => sock.sendMessage(id, { text: stdout || 'Gagal membuka kalkulator.' }));
        }
    });
}
startBot();
