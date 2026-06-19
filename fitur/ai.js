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
                    content: `Kamu adalah asisten keuangan pribadi yang ramah.
                    Bantu pengguna mencatat dan menganalisis keuangan mereka.
                    Jawab dalam bahasa Indonesia yang santai.
                    Jika pengguna menyebut pemasukan atau pengeluaran, ekstrak informasinya
                    dan sisipkan di akhir balasan dengan format ini TANPA spasi:
                    [CATAT:{"tipe":"pemasukan","jumlah":50000,"keterangan":"gaji"}]
                    Tipe hanya boleh: pemasukan atau pengeluaran.
                    Jumlah harus angka tanpa titik atau koma.`
                }
            ];
        }

        riwayatChat[id].push({ role: 'user', content: pertanyaan });

        if (riwayatChat[id].length > 21) {
            riwayatChat[id].splice(1, 2);
        }

        const response = await groq.chat.completions.create({
            model: 'llama3-8b-8192',
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