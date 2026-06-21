const config = require('../config');

const terkirim = new Map();

function getKey(grupId, keyword, target) {
    return `${grupId}:${keyword}:${target}`;
}

function analisisPesan(teks) {
    const lower = teks.toLowerCase();
    const hasil = [];

    for (const [keyword, targets] of Object.entries(config.keywords)) {
        if (lower.includes(keyword)) {
            hasil.push({ keyword, targets });
        }
    }

    return hasil;
}

function cekDuplikat(grupId, keyword, target, teks) {
    const key = getKey(grupId, keyword, target);
    if (terkirim.get(key) === teks) return true;
    terkirim.set(key, teks);
    return false;
}

module.exports = { analisisPesan, cekDuplikat };
