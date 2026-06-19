const { default: makeWASocket, useMultiFileAuthState, delay, Browsers } = require('@whiskeysockets/baileys');
const pino = require('pino');
const readline = require('readline');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const question = (text) => new Promise((resolve) => rl.question(text, resolve));

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('sesi_login');

    const sock = makeWASocket({
        auth: state,
        logger: pino({ level: 'silent' }),
        browser: Browsers.ubuntu('Chrome'), // Menyamarkan koneksi sebagai Chrome stabil
        syncFullHistory: false // Mematikan sinkronisasi chat lama agar loading sangat cepat
    });

    sock.ev.on('creds.update', saveCreds);

    // Memantau Status Koneksi
    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            const alasanError = lastDisconnect?.error?.output?.statusCode;
            if (alasanError !== 401) {
                console.log('🔄 Koneksi tidak stabil, mencoba menyambungkan ulang...');
                startBot();
            }
        } else if (connection === 'open') {
            console.log('\n🎉 BERHASIL! Bot WhatsApp Anda Sudah Aktif dan Terhubung.');
        }
    });

    // Logika Pairing Code
    if (!sock.authState.creds.registered) {
        console.log('\n=== PROSES PENAUTAN BOT ===');
        const nomor = await question('Masukkan nomor WA Bot Anda (Contoh: 628123456789): ');
        const nomorBersih = nomor.replace(/[^0-9]/g, '');
        
        console.log('⏳ Sedang meminta kode pairing dari WhatsApp...');
        await delay(3000);
        
        try {
            const code = await sock.requestPairingCode(nomorBersih);
            console.log('\n========================================');
            console.log(`👉 KODE PAIRING BARU ANDA: ${code}`);
            console.log('========================================');
            console.log('💡 SEGERA masukkan kode di atas ke WhatsApp HP Anda!');
            console.log('Pastikan koneksi internet HP Anda lancar.');
        } catch (err) {
            console.log('\nGagal meminta kode. Silakan ketik "rm -rf sesi_login" lalu coba lagi.');
        }
        rl.close();
    }
}

startBot();
