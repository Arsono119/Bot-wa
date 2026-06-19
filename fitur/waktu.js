async function waktu(sock, id) {
    const zonaWaktu = [
        { zona: 'America/New_York',    label: '🇺🇸 New York (ET)' },
        { zona: 'America/Chicago',     label: '🇺🇸 Chicago (CT)' },
        { zona: 'America/Denver',      label: '🇺🇸 Denver (MT)' },
        { zona: 'America/Los_Angeles', label: '🇺🇸 Los Angeles (PT)' },
        { zona: 'Asia/Jakarta',        label: '🇮🇩 Jakarta (WIB)' },
        { zona: 'Asia/Makassar',       label: '🇮🇩 Makassar (WITA)' },
        { zona: 'Asia/Jayapura',       label: '🇮🇩 Jayapura (WIT)' },
        { zona: 'Asia/Tokyo',          label: '🇯🇵 Tokyo (JST)' },
        { zona: 'Asia/Shanghai',       label: '🇨🇳 Shanghai (CST)' },
        { zona: 'Asia/Dubai',          label: '🇦🇪 Dubai (GST)' },
        { zona: 'Europe/London',       label: '🇬🇧 London (GMT)' },
        { zona: 'Europe/Paris',        label: '🇫🇷 Paris (CET)' },
        { zona: 'Europe/Moscow',       label: '🇷🇺 Moscow (MSK)' },
    ];

    const sekarang = new Date();
    const baris = zonaWaktu.map(({ zona, label }) => {
        const jam = sekarang.toLocaleString('id-ID', {
            timeZone: zona,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });
        return `${label}: *${jam}*`;
    });

    const pesan =
`🕐 *CEK WAKTU GLOBAL* 🕐

━━━━━ 🌎 AMERIKA ━━━━━
${baris[0]}
${baris[1]}
${baris[2]}
${baris[3]}

━━━━━ 🌏 ASIA ━━━━━
${baris[4]}
${baris[5]}
${baris[6]}
${baris[7]}
${baris[8]}
${baris[9]}

━━━━━ 🌍 EROPA ━━━━━
${baris[10]}
${baris[11]}
${baris[12]}`;

    await sock.sendMessage(id, { text: pesan });
}

module.exports = { waktu };