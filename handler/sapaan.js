const kataSapaan = ['halo', 'hi', 'hey', 'hai', 'hello', 'p'];

async function sapaan(sock, id) {
    await sock.sendMessage(id, {
        text: `👋 Halo! Ada yang bisa dibantu?`
    });
}

module.exports = { kataSapaan, sapaan };
