const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');

async function startBot() {
    // Menyimpan sesi login agar tidak perlu scan QR terus-menerus
    const { state, saveCreds } = await useMultiFileAuthState('sesi_login');

    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: true // Memunculkan QR Code di Termux
    });

    sock.ev.on('creds.update', saveCreds);

    // Membaca chat masuk
    sock.ev.on('messages.upsert', async (m) => {
        const pesanMasuk = m.messages[0];
        if (!pesanMasuk.message || pesanMasuk.key.fromMe) return;

        const teks = pesanMasuk.message.conversation || pesanMasuk.message.extendedTextMessage?.text;
        const nomorPengirim = pesanMasuk.key.remoteJid;

        // Jika ada yang chat "ping", bot akan membalas "pong!"
        if (teks?.toLowerCase() === 'ping') {
            await sock.sendMessage(nomorPengirim, { text: 'pong! Bot berhasil merespon.' });
        }
    });
}

startBot();
