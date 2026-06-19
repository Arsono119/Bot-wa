const { default: makeWASocket, useMultiFileAuthState, delay } = require('@whiskeysockets/baileys');
const pino = require('pino');
const readline = require('readline');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const question = (text) => new Promise((resolve) => rl.question(text, resolve));

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('sesi_login');

    const sock = makeWASocket({
        auth: state,
        logger: pino({ level: 'silent' }) // Menyembunyikan log teks yang berisikan eror tadi
    });

    sock.ev.on('creds.update', saveCreds);

    // Logika Pairing Code jika belum login
    if (!sock.authState.creds.registered) {
        console.log('--- LOGIN BOT WHATSAPP ---');
        const nomor = await question('Masukkan nomor WA Bot Anda (Contoh: 628123456789): ');
        const nomorBersih = nomor.replace(/[^0-9]/g, '');
        
        console.log('Sedang meminta kode penautan...');
        await delay(3000);
        
        const code = await sock.requestPairingCode(nomorBersih);
        console.log(`\n👉 KODE PAIRING ANDA: ${code}\n`);
        rl.close();
    }

    // Memantau Status Koneksi
    sock.ev.on('connection.update', (update) => {
        const { connection } = update;
        if (connection === 'open') {
            console.log('🎉 Selesai! Bot WhatsApp Berhasil Terhubung.');
        }
    });

    // Membaca Chat Masuk
    sock.ev.on('messages.upsert', async (m) => {
        const pesanMasuk = m.messages[0];
        if (!pesanMasuk.message || pesanMasuk.key.fromMe) return;

        const teks = pesanMasuk.message.conversation || pesanMasuk.message.extendedTextMessage?.text;
        const nomorPengirim = pesanMasuk.key.remoteJid;

        if (teks?.toLowerCase() === 'ping') {
            await sock.sendMessage(nomorPengirim, { text: 'pong! Bot berhasil merespon.' });
        }
    });
}

startBot();

