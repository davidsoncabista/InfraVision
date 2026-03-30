# 🌐 InfraVision - Data Center Infrastructure Management

**InfraVision** é uma aplicação web moderna (DCIM) projetada para visualização, gerenciamento e automação detalhados de infraestrutura de TI em ambientes de missão crítica.

---

## 🚀 Sobre o Projeto
O sistema permite que operadores e gerentes visualizem a disposição física através de uma **planta baixa interativa**, gerenciem inventário com **visão gráfica de racks** e controlem acessos proativamente. 

> **Filosofia:** Priorizamos a estabilidade e a independência. Um sistema funcional, robusto e **100% self-hosted** é mais importante que novas funcionalidades dependentes de nuvens de terceiros.

## 📚 Documentação Detalhada
Consulte os documentos técnicos para entender a arquitetura:
- 🏗️ [**ARCHITECTURE.md**](ARCHITECTURE.md) - Visão geral e Tech Stack.
- 📅 [**DAILY.md**](DAILY.md) - Diário de bordo e metas.
- 📋 [**CHANGELOG.md**](CHANGELOG.md) - Histórico de atualizações.

## 🛠️ Stack Tecnológica (Self-Hosted)
- **Frontend:** [Next.js 15](https://nextjs.org/) (App Router) + [TypeScript](https://www.typescriptlang.org/)
- **UI & Style:** [Tailwind CSS](https://tailwindcss.com/) + [ShadCN/UI](https://ui.shadcn.com/)
- **Banco de Dados:** [PostgreSQL](https://www.postgresql.org/) (Container Isolado)
- **API REST:** [PostgREST](https://postgrest.org/) (Backend veloz e leve)
- **Armazenamento de Arquivos (S3):** [MinIO](https://min.io/) (Object Storage Self-Hosted)
- **Autenticação:** [NextAuth.js](https://next-auth.js.org/) (Credenciais Locais)
- **Infraestrutura (IaC):** Ansible, Docker Compose e Proxmox LXC.

## ⚙️ Instalação e Setup (Desenvolvimento Local)
```bash
# 1. Instale as dependências
npm install

# 2. Configure o ambiente
cp .env.example .env # Preencha com as credenciais locais do BD e NextAuth

# 3. Rodar em desenvolvimento
npm run dev
🐳 Deploy Automatizado (Produção)
O ambiente de produção é provisionado inteiramente via Ansible. Com um único comando, o servidor LXC é criado no Proxmox, a rede é configurada e a stack Docker (DB + API + Web) é levantada de forma segura.

```
Para atualizar o código da aplicação já em produção, basta acessar o servidor via console/SSH e rodar o script raiz:

```bash
./deploy.sh
```

👨‍💻 Desenvolvedor Principal
Davidson Santos Conceição
Critical Mission Environment Operations Resident
🏢 Empresa: Fundamentos Sistemas (Alocado na TIM)

📧 E-mails:

davidson.conceicao@fundamentos.com.br

dconceicao_fundamentos@timbrasil.com

davidson.php@gmail.com

📞 Contatos: +55 (12) 99732-4548 / (91) 98426-0688 / (73) 99119-9676

Atualizado em Março/2026 por davidson.dev.br


### O que fazer em seguida:
Salve o arquivo `README.md` no VS Code. Quando a instalação do `next-auth` terminar e você limpar os imports do Firebase como conversamos antes, você pode enviar tudo de uma vez para o GitHub com os seguintes comandos no seu terminal:
