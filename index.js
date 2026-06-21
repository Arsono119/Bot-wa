const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const pino = require('pino');
const config = require('./config');
const { tanyaAI, resetChat } = require('./fitur/ai');
const { analisisPesan, cekDuplikat } = require('./fitur/analyzer');

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
        if (!teks) return;

        const id = msg.key.remoteJid;
        const pengirim = msg.key.participant || id;

        if (id.endsWith('@g.us')) {
            const cocok = analisisPesan(teks);
            for (const { keyword, targets } of cocok) {
                for (const target of targets) {
                    if (cekDuplikat(id, keyword, target, teks)) continue;
                    await sock.sendMessage(target, {
                        text: `ðŸ”” *Notifikasi Grup*\n\n` +
                              `ðŸ“Œ Kata kunci: *${keyword}*\n` +
                              `ðŸ‘¤ Dari: @${pengirim.split('@')[0]}\n` +
                              `ðŸ’¬ Pesan: ${teks}\n\n` +
                              `_Balas chat ini untuk reply ke grup_`,
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
