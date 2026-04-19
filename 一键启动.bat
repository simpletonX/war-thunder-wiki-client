@echo off
cd /d %~dp0

IF NOT EXIST node_modules (
    echo 安装依赖中...
    npm ci
)

npm run dev