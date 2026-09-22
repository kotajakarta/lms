#!/usr/bin/env bash

# ==============================================================================
# UZDEM LMS - Local Development Launcher Script
# Menjalankan Backend (NestJS) dan Frontend (React Vite) secara bersamaan.
# ==============================================================================

# Warna terminal
GREEN='\033[0;32m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color
BOLD='\033[1m'

# Resolusi path absolut direktori
APPS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$APPS_DIR/backend"
FRONTEND_DIR="$APPS_DIR/frontend"

clear
echo -e "${CYAN}${BOLD}"
echo "=================================================================="
echo "         🚀 UZDEM LMS - LOCAL DEVELOPMENT ENVIRONMENT             "
echo "         Backend: NestJS + Prisma  |  Frontend: React + Vite     "
echo "=================================================================="
echo -e "${NC}"

# 1. Cek keberadaan Node.js & npm
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Error: Node.js tidak ditemukan di sistem Anda!${NC}"
    exit 1
fi

NODE_VER=$(node -v)
NPM_VER=$(npm -v)
echo -e "📦 Node.js: ${GREEN}${NODE_VER}${NC} | npm: ${GREEN}${NPM_VER}${NC}"

# 2. Cek file .env di backend
if [ ! -f "$BACKEND_DIR/.env" ]; then
    echo -e "${YELLOW}⚠️  Peringatan: $BACKEND_DIR/.env tidak ditemukan! Menyalin dari .env.example...${NC}"
    if [ -f "$BACKEND_DIR/.env.example" ]; then
        cp "$BACKEND_DIR/.env.example" "$BACKEND_DIR/.env"
        echo -e "${GREEN}✅ File .env berhasil dibuat dari template.${NC}"
    fi
else
    echo -e "🔒 Backend .env: ${GREEN}Terdeteksi & Terkonfigurasi${NC}"
fi

# 3. Cek dependensi Backend
if [ ! -d "$BACKEND_DIR/node_modules" ]; then
    echo -e "\n${YELLOW}📥 Menginstall dependensi Backend (NestJS + Prisma)... Mohon tunggu...${NC}"
    (cd "$BACKEND_DIR" && npm install)
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Gagal menginstall dependensi Backend!${NC}"
        exit 1
    fi
fi

# 4. Sinkronisasi Skema Database & Generate Prisma Client
echo -e "${BLUE}⚙️  Sinkronisasi skema database ke MariaDB (npx prisma db push)...${NC}"
(cd "$BACKEND_DIR" && npx prisma db push)
if [ $? -ne 0 ]; then
    echo -e "${RED}⚠️  Peringatan: Gagal melakukan db push. Pastikan koneksi MariaDB pada .env aktif.${NC}"
fi

# Generate Prisma Client
echo -e "${BLUE}⚙️  Generate Prisma Client...${NC}"
(cd "$BACKEND_DIR" && npx prisma generate)

# Build Backend TypeScript
echo -e "${BLUE}⚙️  Build Backend TypeScript...${NC}"
(cd "$BACKEND_DIR" && npx tsc -p tsconfig.build.json)

# Parameter opsional: jika dijalankan dengan ./dev.sh --seed
if [[ "$*" == *"--seed"* ]]; then
    echo -e "${YELLOW}🌱 Menjalankan Seeder database...${NC}"
    (cd "$BACKEND_DIR" && npx prisma db seed)
fi

# 5. Cek dependensi Frontend
if [ ! -x "$FRONTEND_DIR/node_modules/.bin/vite" ] || [ ! -x "$FRONTEND_DIR/node_modules/.bin/tsc" ]; then
    echo -e "\n${YELLOW}📥 Menginstall dependensi Frontend (React + Tailwind)... Mohon tunggu...${NC}"
    (cd "$FRONTEND_DIR" && npm install)
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Gagal menginstall dependensi Frontend!${NC}"
        exit 1
    fi
fi

# 6. Fungsi penanganan shutdown graceful (Ctrl+C)
cleanup() {
    echo ""
    echo -e "${YELLOW}🛑 Menerima sinyal keluar... Mematikan service...${NC}"
    if [ -n "$BACKEND_PID" ]; then
        kill -TERM "$BACKEND_PID" 2>/dev/null
    fi
    if [ -n "$FRONTEND_PID" ]; then
        kill -TERM "$FRONTEND_PID" 2>/dev/null
    fi
    wait "$BACKEND_PID" 2>/dev/null
    wait "$FRONTEND_PID" 2>/dev/null
    echo -e "${GREEN}✅ Semua proses dev server telah dimatikan dengan aman.${NC}"
    exit 0
}

trap cleanup SIGINT SIGTERM

echo -e "\n${GREEN}${BOLD}✨ Menjalankan Service Development...${NC}"
echo -e "------------------------------------------------------------------"
echo -e "  🌐 ${BOLD}Frontend App:${NC}     ${CYAN}http://localhost:5173${NC}"
echo -e "  ⚙️  ${BOLD}Backend API:${NC}      ${CYAN}http://localhost:3000/api/v1${NC}"
echo -e "  📚 ${BOLD}Swagger API Docs:${NC} ${CYAN}http://localhost:3000/api/docs${NC}"
echo -e "------------------------------------------------------------------"
echo -e "${YELLOW}Tekan Ctrl+C kapan saja untuk menghentikan kedua server.${NC}\n"

# 7. Jalankan Backend & Frontend secara konkuren
export CHOKIDAR_USEPOLLING=true
export CHOKIDAR_INTERVAL=100

cd "$BACKEND_DIR" && CHOKIDAR_USEPOLLING=true CHOKIDAR_INTERVAL=100 npm run start:dev &
BACKEND_PID=$!

cd "$FRONTEND_DIR" && npm run dev -- --host 0.0.0.0 &
FRONTEND_PID=$!

# Tunggu sampai salah satu proses berhenti
wait
