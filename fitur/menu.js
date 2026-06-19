async function menu(sock, id) {
    await sock.sendMessage(id, {
        text: `🤖 *MENU BOT* 🤖\n\n• *! 1* : Cek Waktu Global\n• *ping* : Cek Bot Aktif`
    });
}

module.exports = { menu };