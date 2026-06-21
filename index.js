const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const pino = require('pino');
const qrcode = require('qrcode-terminal');
const config = require('./config');
const { tanyaAI, resetChat } = require('./fitur/ai');
const { analisisPesan, cekDuplikat } = require('./fitur/analyzer');

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState(config.sesiLogin);
    const sock = makeWASocket({
        auth: state,
        logger: pino({ level: 'info' }),
        browser: ['Ubuntu', 'Chrome', '120.0'],
        syncFullHistory: false
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', ({ connection, qr }) => {
        if (qr) {
            console.log('\nâ•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•');
            console.log('  SCAN QR CODE INI DENGAN WHATSAPP KAMU');
            console.log('  Buka WhatsApp > Titik 3 > Linked Devices');
            console.log('â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•\n');
            qrcode.generate(qr, { small: true });
        }
        if (connection === 'close') startBot();
        else if (connection === 'open') console.log(config.pesanAktif);
    });

    sock.ev.on('messages.upsert', async (m) => {
        const msg = m.messages[0];
        if (!msg.message || msg.key.fromMe) return;

        const teks = msg.message.conversation ||
                     msg.message.extendedTextMessage?.text ||
                     msg.message.imageMessage?.caption || "";
        if (!teks) return;

        const id = msg.key.remoteJid;
        const pengirim = msg.key.participant || id;

        if (id.endsWith('@g.us')) {
            const cocok = analisisPesan(teks);
            for (const { keyword, targets } of cocok) {
                for (const target of targets) {
                    if (cekDuplikat(id, keyword, target, teks)) continue;
                    await sock.sendMessage(target, {
                        text: `ðŸ”” *${keyword}*\nðŸ‘¤ @${pengirim.split('@')[0]}\nðŸ’¬ ${teks}`,
                        mentions: [pengirim]
                    });
                }
            }
        } else {
            const cmd = teks.trim().toLowerCase();

            if (cmd === 'ping') {
                return sock.sendMessage(id, { text: 'ðŸ“ Pong! Bot aktif.' });
            }

            if (cmd === '!reset') {
                resetChat(id);
                return sock.sendMessage(id, { text: 'ðŸ”„ Riwayat chat direset!' });
            }

            const balasan = await tanyaAI(id, teks);
            await sock.sendMessage(id, { text: balasan });
        }
    });
}

startBot();
