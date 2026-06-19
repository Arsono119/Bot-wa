#!/bin/bash

# --- FUNGSI INSTAN UNTUK BOT WHATSAPP ---
if [ "$1" == "waktu" ]; then
    echo "🕒 *WAKTU SERVER:* $(date)"
    exit 0

elif [ "$1" == "speed" ]; then
    echo "🚀 *MEMULAI PENGUJIAN KECEPATAN INTERNET* 🚀"
    echo "----------------------------------------"
    
    # Cek apakah command speedtest-cli sudah terinstall
    if ! command -v speedtest-cli &> /dev/null; then
        echo "⏳ Menginstall tools speedtest terlebih dahulu..."
        pip install speedtest-cli &> /dev/null
    fi
    
    # Jalankan speedtest asli dan ambil hasil intinya saja
    HASIL=$(speedtest-cli --simple 2>&1)
    if [ $? -eq 0 ]; then
        echo -e "$HASIL"
    else
        echo "❌ Gagal terhubung ke server Speedtest. Cek koneksi internet Termux Anda."
    fi
    exit 0

elif [ "$1" == "kalkulator" ]; then
    echo "🧮 *ALAT KALKULATOR INSTAN*"
    echo "----------------------------------------"
    echo "💡 _Cara pakai: Kirim perintah diikuti rumusnya._"
    echo "_Contoh rumus matematika dasar yang aman:_ "
    echo "• \`bc <<< \"5 + 5 * 2\"\`"
    echo "• \`bc <<< \"100 / 4\"\`"
    echo "----------------------------------------"
    echo "Hasil Tes Math (150 + 250):"
    echo "👉 $(bc <<< "150 + 250")"
    exit 0
fi

# --- MENU MANUAL JIKA DIJALANKAN DI TERMUX (./menu.sh) ---
while true; do
    clear
    echo "=== MENU UTAMA V0.01 ==="
    echo "1. Cek Waktu"
    echo "2. Cek Speed Internet"
    echo "3. Alat Kalkulator (Tes)"
    echo "4. Keluar"
    read -p "Pilih opsi (1-4): " pil

    case $pil in
        1) echo ""; date; read -p "Enter...";;
        2) echo ""; speedtest-cli --simple; read -p "Enter...";;
        3) echo ""; echo "Hasil 150 + 250 = $(bc <<< "150 + 250")"; read -p "Enter...";;
        4) exit 0;;
        *) echo "Pilihan salah!"; sleep 1;;
    esac
done
