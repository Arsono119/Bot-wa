cat > handler / sapaan.js << 'EOF'
const kataSapaan = ['halo', 'hi', 'hey', 'hai', 'hello', 'p'];

async function sapaan(sock, id) {
    await sock.sendMessage(id, {
        text: `👋 Halo! Selamat datang!\nKetik *!menu* untuk melihat fitur yang tersedia.`
    });
}

module.exports = { kataSapaan, sapaan };
EOF