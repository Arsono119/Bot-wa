#!/bin/bash
echo "Mengambil update dari GithHub..."
git pull

echo "Menginstall dependencies..."
npm install

echo "Menjalankan bot"
node indexcode2.js
