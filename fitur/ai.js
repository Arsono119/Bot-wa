const Groq = require('groq-sdk');
const config = require('../config');
const { searchWeb } = require('./webSearch');

const groq = new Groq({ apiKey: config.groqKey });
const riwayatChat = {};

const SYSTEM_PROMPT = `Kamu adalah asisten AI yang membantu di WhatsApp.

Aturan:
1. Jawab singkat, padat, jelas (maks 2-3 paragraf), langsung ke inti
2. Gunakan bahasa Indonesia yang santai
3. Jika diberikan hasil pencarian internet, jawab berdasarkan info tersebut
4. Jika tidak tahu, bilang tidak tahu
5. Jangan menambahkan informasi yang tidak ada`;

function butuhSearch(teks) {
    const lower = teks.toLowerCase().trim().replace(/[^a-z0-9\s]/g, '');

    // Skip pure greetings
    const greetings = ['halo', 'hai', 'hi', 'hey', 'p', 'test', 'tes'];
    if (greetings.includes(lower)) return false;
    if (/^(halo|hai|hi|hey)\s/.test(lower) && !/\b(cari|berita|cuaca|harga|info|gempa)\b/.test(lower)) return false;
    if (/^apa kabar/.test(lower)) return false;

    const trigger = [
        'cari', 'search', 'google', 'berita', 'cuaca', 'suhu',
        'gempa', 'tsunami', 'banjir', 'harga', 'jadwal', 'skor',
        'pemilu', 'presiden', 'peringatan dini',
    ];

    for (const k of trigger) {
        if (lower.includes(k)) return true;
    }

    const contextual = ['terbaru', 'terkini', 'update', 'sekarang', 'hari ini'];
    const words = lower.split(/\s+/).filter(w => w.length > 2);
    for (const k of contextual) {
        if (lower.includes(k) && words.length >= 2) return true;
    }

    return false;
}

async function tanyaAI(id, pesan) {
    try {
        if (!riwayatChat[id]) {
            riwayatChat[id] = [{ role: 'system', content: SYSTEM_PROMPT }];
        }

        riwayatChat[id].push({ role: 'user', content: pesan });
        if (riwayatChat[id].length > 21) riwayatChat[id].splice(1, 2);

        let searchInject = false;
        let finalPesan = pesan;

        if (butuhSearch(pesan)) {
            const hasil = await searchWeb(pesan);
            if (hasil.length > 0) {
                const konteks = hasil.map((r, i) =>
                    `${i + 1}. ${r.title}\n   ${r.url}\n   ${r.snippet}`
                ).join('\n\n');
                finalPesan = `${pesan}\n\nHasil pencarian:\n${konteks}`;
                searchInject = true;
            }
        }

        if (searchInject) {
            riwayatChat[id][riwayatChat[id].length - 1].content = finalPesan;
        }

        const response = await groq.chat.completions.create({
            model: 'llama-3.1-8b-instant',
            messages: riwayatChat[id],
            max_tokens: 1024,
        });

        const balasan = response.choices[0].message.content;
        riwayatChat[id].push({ role: 'assistant', content: balasan });
        return balasan;

    } catch (err) {
        console.error('Error Groq:', err);
        return '❌ AI sedang bermasalah, coba lagi nanti.';
    }
}

function resetChat(id) {
    delete riwayatChat[id];
}

module.exports = { tanyaAI, resetChat };
