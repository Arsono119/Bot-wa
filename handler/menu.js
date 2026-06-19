async function menu(sock, id) {
    await sock.sendMessage(id, {
        text: `🤖 *MENU BOT* 🤖\n\n` +
              `💬 *AI Keuangan*\n` +
              `Chat bebas untuk catat keuangan!\n` +
              `Contoh:\n` +
              `_"beli makan siang 25rb"_\n` +
              `_"gajian 5 juta"_\n` +
              `_"bayar listrik 150 ribu"_\n\n` +
              `📋 *Command*\n` +
              `• *! 1* : Cek Waktu Global\n` +
              `• *!saldo* : Ringkasan keuangan kamu\n` +
              `• *!reset* : Reset chat AI\n` +
              `• *ping* : Cek Bot Aktif`
    });
}

module.exports = { menu };