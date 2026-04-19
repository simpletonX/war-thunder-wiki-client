#!/bin/bash
cd "$(dirname "$0")"

if [ ! -d "node_modules" ]; then
  echo "安装依赖中..."
  npm ci
fi

npm run dev