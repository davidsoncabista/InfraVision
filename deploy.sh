#!/bin/bash

# ==========================================
# DEFINIÇÃO DE CORES
# ==========================================
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

APP_DIR="/opt/infravision"

echo -e "${GREEN}==================================================${NC}"
echo -e "${GREEN}      DEPLOY SEGURO - INFRAVISION (DOCKER)        ${NC}"
echo -e "${GREEN}==================================================${NC}"

cd $APP_DIR || { echo -e "${RED}Diretório $APP_DIR não encontrado!${NC}"; exit 1; }

# 1. ATUALIZAR O CÓDIGO (GIT)
echo -e "${YELLOW}--- 1. Baixando atualizações do Git... ---${NC}"
git fetch --all
git reset --hard origin/main
git pull origin main

# 2. RECONSTRUIR APENAS O FRONTEND (WEB) E REINICIAR
echo -e "${YELLOW}--- 2. Compilando o Next.js e subindo os containers... ---${NC}"
# O --build força o docker a ler o Dockerfile de novo
# O -d roda em background
docker compose up -d --build web

# 3. LIMPEZA DE IMAGENS ÓRFÃS (Opcional, poupa espaço no Proxmox)
echo -e "${YELLOW}--- 3. Limpando imagens antigas do Docker... ---${NC}"
docker image prune -f

# 4. HEALTH CHECK NO NEXT.JS
echo -e "${YELLOW}--- 4. Executando Health Check (Max 30s)... ---${NC}"
HEALTH_CHECK_URL="http://127.0.0.1:3000/login"
SUCCESS=false

for i in {1..6}; do
    if curl -s -f "$HEALTH_CHECK_URL" > /dev/null; then
        echo -e "${GREEN}✅ SUCESSO! A aplicação Next.js respondeu corretamente.${NC}"
        SUCCESS=true
        break
    else
        echo -n "."
        sleep 5
    fi
done
echo ""

if [ "$SUCCESS" = false ]; then
    echo -e "${RED}⚠️ ALERTA: O Frontend demorou muito para responder.${NC}"
    echo "Últimos logs do container:"
    docker compose logs --tail=20 web
else
    echo -e "${GREEN}==================================================${NC}"
    echo -e "${GREEN}        DEPLOY CONCLUÍDO COM SUCESSO! 🚀          ${NC}"
    echo -e "${GREEN}==================================================${NC}"
fi
