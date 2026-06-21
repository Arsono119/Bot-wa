const Groq = require('groq-sdk');
const config = require('../config');
const { searchWeb } = require('./webSearch');

const groq = new Groq({ apiKey: config.groqKey });
const riwayatChat = {};

const SYSTEM_PROMPT = `Kamu adalah asisten AI yang membantu di WhatsApp.

Aturan:
1. Jawab singkat, padat, dan jelas (maks 2-3 paragraf)
2. Gunakan bahasa Indonesia yang santai
3. Jika diberikan hasil pencarian internet, WAJIB gunakan informasi tersebut untuk menjawab
4. Sebutkan sumbernya jika relevan
5. Jika tidak tahu, bilang tidak tahu
6. Jangan mengada-ada atau menambahkan informasi yang tidak ada`;

function sapaanSaja(teks) {
    const lower = teks.toLowerCase().trim();
    const sapa = ['halo', 'hai', 'hi', 'hey', 'p', 'test', 'tes'];
    if (sapa.includes(lower)) return true;
    if (/^(halo|hai|hi|hey)\s(apa kabar|kabar|gimana|baik)\b/.test(lower)) return true;
    if (/^(makasih|terima kasih|thanks|ok|oke|sip|yes|ya)\b/.test(lower)) return true;
    return false;
}

async function tanyaAI(id, pesan) {
    try {
        if (!riwayatChat[id]) {
            riwayatChat[id] = [{ role: 'system', content: SYSTEM_PROMPT }];
        }

        // Search web for almost everything (except pure greetings)
        let finalPesan = pesan;
        if (!sapaanSaja(pesan)) {
            const hasil = await searchWeb(pesan);
            if (hasil.length > 0) {
                const konteks = hasil.map((r, i) =>
                    `${i + 1}. ${r.title}\n   ${r.url}\n   ${r.snippet}`
                ).join('\n\n');
                finalPesan = `Pertanyaan: ${pesan}\n\nHasil pencarian internet:\n${konteks}\n\nJawab berdasarkan hasil di atas jika relevan. Jika tidak, jawab dari pengetahuanmu.`;
            }
        }

        riwayatChat[id].push({ role: 'user', content: finalPesan });
        if (riwayatChat[id].length > 21) riwayatChat[id].splice(1, 2);

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
