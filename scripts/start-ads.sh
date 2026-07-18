#!/bin/bash
cd "$(dirname "$0")/.." || exit 1

echo "▶ Avvio ADS of the day..."
echo "   Apri http://localhost:3000 nel browser"
echo "   Chiudi questa finestra per fermare il sito."
echo ""

npm run dev
