const fs = require('fs');
const path = require('path');

const folderData = path.join(__dirname, '../data');

// Buat folder data jika belum ada
if (!fs.existsSync(folderData)) {
    fs.mkdirSync(folderData);
}

function getNamaFile(id) {
    const nomor = id.replace('@s.whatsapp.net', '').replace('@g.us', '');
    return path.join(folderData, `${nomor}.json`);
}

function bacaData(id) {
    const file = getNamaFile(id);
    if (!fs.existsSync(file)) {
        return { pemasukan: [], pengeluaran: [] };
    }
    return JSON.parse(fs.readFileSync(file, 'utf-8'));
}

function simpanData(id, data) {
    fs.writeFileSync(getNamaFile(id), JSON.stringify(data, null, 2));
}

function catatKeuangan(id, tipe, jumlah, keterangan) {
    const data = bacaData(id);
    const transaksi = {
        tanggal: new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }),
        jumlah: Number(jumlah),
        keterangan: keterangan
    };

    data[tipe].push(transaksi);
    simpanData(id, data);

    const emoji = tipe === 'pemasukan' ? '💰' : '💸';
    return `${emoji} Tercatat sebagai *${tipe}*\n💵 Jumlah: Rp ${Number(jumlah).toLocaleString('id-ID')}\n📝 Keterangan: ${keterangan}`;
}

function ringkasanKeuangan(id) {
    const data = bacaData(id);

    const totalPemasukan = data.pemasukan.reduce((a, b) => a + b.jumlah, 0);
    const totalPengeluaran = data.pengeluaran.reduce((a, b) => a + b.jumlah, 0);
    const saldo = totalPemasukan - totalPengeluaran;

    const riwayatTerbaru = [...data.pemasukan.map(d => ({...d, tipe: 'pemasukan'})),
                            ...data.pengeluaran.map(d => ({...d, tipe: 'pengeluaran'}))]
        .sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal))
        .slice(0, 5);

    const riwayatTeks = riwayatTerbaru.map(d =>
        `• ${d.tipe === 'pemasukan' ? '💰' : '💸'} ${d.keterangan}: Rp ${d.jumlah.toLocaleString('id-ID')}`
    ).join('\n');

    return `📊 *RINGKASAN KEUANGAN*\n\n` +
           `💰 Total Pemasukan: Rp ${totalPemasukan.toLocaleString('id-ID')}\n` +
           `💸 Total Pengeluaran: Rp ${totalPengeluaran.toLocaleString('id-ID')}\n` +
           `💵 Saldo: Rp ${saldo.toLocaleString('id-ID')}\n\n` +
           `📋 *5 Transaksi Terakhir:*\n${riwayatTerbaru.length ? riwayatTeks : 'Belum ada transaksi'}`;
}

module.exports = { catatKeuangan, ringkasanKeuangan };