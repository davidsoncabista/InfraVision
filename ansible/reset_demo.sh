#!/bin/bash
# Script para resetar o ambiente de demonstração toda madrugada
cd /opt/infravision || exit 1

echo "Derrubando containers e apagando o banco de dados..."
# O parâmetro -v é o segredo mágico: ele apaga o volume de dados do PostgreSQL
docker compose down -v

echo "Subindo containers novamente (o init.sql vai recriar o usuario base)..."
docker compose up -d

echo "Limpando lixo..."
docker image prune -f

echo "Reset do ambiente de Demo concluído!"