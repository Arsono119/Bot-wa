async function searchWeb(query) {
    try {
        const q = optimizeQuery(query);
        const url = `https://www.bing.com/search?q=${encodeURIComponent(q)}`;
        const res = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
            }
        });
        const html = await res.text();

        const results = [];
        const blockRegex = /<li class="b_algo[^"]*"[^>]*>([\s\S]*?)<\/li>/g;
        let match;

        while ((match = blockRegex.exec(html)) !== null && results.length < 5) {
            const block = match[1];
            const titleMatch = block.match(/<h2[^>]*>[\s\S]*?<a[^>]*>([\s\S]*?)<\/a>/);
            const citeMatch = block.match(/<cite>([^<]+)<\/cite>/);
            const snippetMatch = block.match(/<p[^>]*>([\s\S]*?)<\/p>/);

            if (titleMatch) {
                const title = titleMatch[1].replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, ' ').replace(/\s+/g, ' ').trim();
                const rawUrl = citeMatch ? citeMatch[1].trim() : '';
                const urlClean = rawUrl.startsWith('http') ? rawUrl : 'https://' + rawUrl;
                const snippet = snippetMatch
                    ? snippetMatch[1].replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, ' ').replace(/\s+/g, ' ').trim()
                    : '';

                if (title && urlClean !== 'https://' && !title.includes('JavaScript')) {
                    results.push({ title, url: urlClean, snippet });
                }
            }
        }
        return results;
    } catch (err) {
        console.error('SearchWeb error:', err);
        return [];
    }
}

async function cariCuaca(kota) {
    try {
        const res = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=-6.21&longitude=106.85&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min&timezone=auto`,
            { signal: AbortSignal.timeout(5000) }
        );
        if (!res.ok) return null;
        const data = await res.json();
        const kodeCuaca = {
            0: 'Cerah', 1: 'Cerah berawan', 2: 'Berawan', 3: 'Mendung',
            45: 'Berkabut', 51: 'Gerimis ringan', 53: 'Gerimis', 55: 'Gerimis deras',
            61: 'Hujan ringan', 63: 'Hujan', 65: 'Hujan deras',
            71: 'Salju ringan', 73: 'Salju', 75: 'Salju deras',
            80: 'Hujan ringan', 81: 'Hujan', 82: 'Hujan deras',
            95: 'Badai petir', 96: 'Badai petir', 99: 'Badai petir'
        };
        const cuaca = kodeCuaca[data.current.weather_code] || 'Unknown';
        return {
            title: `Cuaca ${kota} Hari Ini`,
            url: 'https://open-meteo.com',
            snippet: `${kota}: ${cuaca}, ${data.current.temperature_2m}°C (terasa ${data.current.apparent_temperature}°C), kelembapan ${data.current.relative_humidity_2m}%, angin ${data.current.wind_speed_10m} km/j. Max ${data.daily.temperature_2m_max[0]}°C / Min ${data.daily.temperature_2m_min[0]}°C.`
        };
    } catch {
        return null;
    }
}

async function searchWebWithWeather(query) {
    const lower = query.toLowerCase();
    let weatherResult = null;

    if (lower.includes('cuaca') || lower.includes('suhu') || lower.includes('weather')) {
        const match = query.match(/(?:cuaca|weather|suhu)\s+(?:di\s+)?(\w+)/i);
        let kota = match ? match[1] : 'Jakarta';
        kota = kota.charAt(0).toUpperCase() + kota.slice(1).toLowerCase();
        weatherResult = await cariCuaca(kota);
    }

    const webResults = await searchWeb(query);
    if (weatherResult) {
        webResults.unshift(weatherResult);
    }
    return webResults;
}

function optimizeQuery(teks) {
    const lower = teks.toLowerCase();

    // Gempa
    if (lower.includes('gempa')) {
        return 'gempa bumi terbaru indonesia 2026';
    }

    // Harga
    if (lower.includes('harga')) {
        const match = teks.match(/harga\s+(.+)/i);
        const barang = match ? match[1].trim() : 'emas';
        return `harga ${barang} 2026`;
    }

    // Cuaca handled by cariCuaca, but keep as fallback
    if (lower.includes('cuaca') || lower.includes('suhu')) {
        const match = teks.match(/(?:cuaca|suhu)\s+(?:di\s+)?(\w+)/i);
        const tempat = match ? match[1] : 'indonesia';
        return `prakiraan cuaca ${tempat} 2026`;
    }

    // Berita/topik terkini
    if (lower.includes('berita') || lower.includes('terbaru') || lower.includes('terkini')) {
        let topik = teks.replace(/\b(cari|search|berita|terbaru|terkini|tentang|info|dari|di|dan|atau)\b/gi, '');
        topik = topik.replace(/\s+/g, ' ').trim();
        return topik ? `${topik} 2026` : 'berita indonesia 2026';
    }

    // "apa yang terjadi di X" -> berita X
    const apaTerjadi = lower.match(/apa\s+yang\s+terjadi\s+(?:di|dengan)\s+(.+)/);
    if (apaTerjadi) {
        return `berita ${apaTerjadi[1]} 2026`;
    }

    // "siapa X" -> langsung X
    const siapaMatch = lower.match(/siapa\s+(.+)/);
    if (siapaMatch) {
        return `${siapaMatch[1]} 2026`;
    }

    // "kapan X" -> jadwal X
    const kapanMatch = lower.match(/kapan\s+(.+)/);
    if (kapanMatch) {
        return `${kapanMatch[1]} 2026`;
    }

    // Remove conversational words for better search results
    let q = teks.replace(/\b(tolong|bisa|yang|di|ke|dari|dan|atau|saya|aku|kami|kamu|enggak|tidak|iya|ya|oh)\b/gi, '');
    q = q.replace(/\s+/g, ' ').trim();
    if (q.length < 3) return teks;

    // Add current year for recency
    if (!/\b(202[0-9]|20[0-9]{2})\b/.test(q)) {
        q += ' 2026';
    }
    return q;
}

module.exports = { searchWeb: searchWebWithWeather, searchWebRaw: searchWeb };
