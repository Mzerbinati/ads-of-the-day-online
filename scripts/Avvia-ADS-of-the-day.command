#!/bin/bash
DIR="$(cd "$(dirname "$0")/.." && pwd)"

# Chiude eventuali server vecchi sulla porta 3000 (servono pagine obsolete)
lsof -ti:3000 | xargs kill -9 2>/dev/null

osascript <<EOF
tell application "Terminal"
  activate
  do script "cd '$DIR' && npm run dev"
end tell
EOF
