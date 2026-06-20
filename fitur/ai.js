const Groq = require('groq-sdk');
const config = require('../config');

const groq = new Groq({ apiKey: config.groqKey });
const riwayatChat = {};

async function tanyaAI(id, pertanyaan) {
    try {
        if (!riwayatChat[id]) {
            riwayatChat[id] = [
                {
                    role: 'system',
                    content: `Kamu adalah asisten keuangan pribadi yang ramah dan santai.
Bantu pengguna mencatat keuangan mereka dalam percakapan natural.
Jawab dalam bahasa Indonesia yang santai seperti teman.
Jika pengguna menyebut pengeluaran atau pemasukan, WAJIB sisipkan tag ini di baris PALING AKHIR balasan:
[CATAT:{"tipe":"pengeluaran","jumlah":20000,"keterangan":"makan siang"}]
Pastikan tipe hanya: pemasukan atau pengeluaran.
Jumlah harus angka bulat tanpa titik koma atau karakter lain.
JANGAN tampilkan tag [CATAT:...] dalam kalimat balasan, cukup di baris terakhir saja dan jangan dibahas.`
                }
            ];
        }

        riwayatChat[id].push({ role: 'user', content: pertanyaan });
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
        return '❌ AI sedang tidak bisa dihubungi, coba beberapa saat lagi.';
    }
}

function resetChat(id) {
    delete riwayatChat[id];
}

module.exports = { tanyaAI, resetChat };