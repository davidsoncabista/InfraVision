# Arquitetura e Plano de Desenvolvimento: InfraVision

## 1. Visão Geral do Projeto

**InfraVision** é um sistema avançado de gerenciamento de infraestrutura de data center (DCIM) projetado para fornecer uma visualização clara, controle preciso e automação inteligente sobre todos os ativos e operações em um ambiente de missão crítica. A aplicação combina uma planta baixa interativa com um robusto sistema de gerenciamento de inventário, permissões e fluxos de trabalho, culminando em futuras integrações com Inteligência Artificial para automação da coleta de dados.

O desenvolvimento é faseado para garantir estabilidade, segurança e a integração contínua de funcionalidades essenciais como controle de acesso e logs de auditoria desde o início.

---

## 2. 🏗️ Stack Tecnológica e Infraestrutura (Revisão 2026-03-30)

O InfraVision é desenhado para operar em missões críticas, sem dependência de internet externa. Toda a arquitetura foi migrada para um modelo **100% Self-Hosted**.

### Core Stack
- **Frontend:** Next.js 15 (App Router), React, TypeScript.
- **Estilização:** Tailwind CSS + ShadCN/UI.
- **Banco de Dados Relacional:** PostgreSQL 16 (Dados estruturados, relações de inventário).
- **Backend/API:** PostgREST (Gera uma API RESTful ultrarrápida diretamente a partir do schema do PostgreSQL).
- **Armazenamento de Arquivos:** MinIO (Object Storage compatível com S3 para plantas baixas e evidências).
- **Autenticação:** NextAuth.js operando via JWT local com senhas hasheadas e controle de roles via banco.

### DevOps & IaC (Infrastructure as Code)
- **Containerização:** Docker e Docker Compose (Orquestração local dos serviços `web`, `api`, `db` e `storage`).
- **Provisionamento:** Ansible. Playbooks interativos criados para construir a infraestrutura do zero (`ansible/deploy_infravision.yaml`), suportando tanto clusters Proxmox (via API/CLI local) quanto servidores genéricos via SSH.
---

## 3. Estratégia de População de Dados

Para garantir um ambiente de desenvolvimento e implantação robusto, a aplicação utiliza duas estratégias complementares de população de dados, acessíveis através de um **Menu de Desenvolvedor**.

### 3.1. Dados Essenciais vs. Dados de Teste

A população de dados é dividida em duas categorias distintas para máxima flexibilidade e estabilidade:

1.  **Dados Essenciais (Catálogo Inteligente):**
    *   **Descrição:** São os dados mínimos e fundamentais para o sistema operar, como status padrão de itens, tipos de porta, e um catálogo rico de Fabricantes e Modelos. Modelos específicos (ex: Switch Catalyst, roteador MX) contêm uma **configuração de portas (`portConfig`)** que permite ao sistema gerar automaticamente todas as portas de um equipamento no momento da sua criação. O catálogo tem foco em equipamentos de TI e Telecom (Nokia, Padtec, Cisco, etc.).
    *   **Finalidade:** Preparar uma instância limpa da aplicação para produção.

2.  **Dados de Teste (Cenário de Demonstração):**
    *   **Descrição:** São dados de exemplo que criam um cenário de uso para desenvolvimento e demonstração (prédios, salas, racks, servidores, usuários de teste, conexões, etc.).
    *   **Finalidade:** Agilizar o desenvolvimento e permitir a validação de funcionalidades.

### 3.2. Métodos de Implantação

1.  **População Assistida (Via Dev Menu - Ideal para Desenvolvimento):**
    *   **Descrição:** O Dev Menu oferece botões **fracionados e idempotentes** (podem ser clicados várias vezes sem causar erro) para popular os Dados Essenciais e os Dados de Teste em etapas. Isso permite um controle granular, seguro e facilita a depuração.
    *   **Uso:** Perfeito para configurar rapidamente um ambiente de desenvolvimento local.

2.  **Implantação Manual (Via Script SQL - Ideal para Produção):**
    *   **Descrição:** O Dev Menu também oferece uma opção para **baixar um arquivo `infra_setup.sql`**. Este script contém todos os comandos `CREATE TABLE` e `INSERT` para os **Dados Essenciais**.
    *   **Uso:** É a abordagem recomendada para produção. Permite que um DBA revise o script e o execute diretamente no banco de dados, garantindo um processo de implantação controlado e transparente, sem poluir a produção com dados de teste.

---

## 4. Filosofia e Fases do Desenvolvimento

### 4.1. Filosofia: Estabilidade em Primeiro Lugar

O plano de desenvolvimento abaixo é um guia, mas não é rígido. A nossa filosofia principal é que **um aplicativo funcional e estável é a característica mais importante**. Portanto, a correção de bugs, a refatoração de código para melhor desempenho e a garantia da integridade dos dados terão **sempre prioridade** sobre o início de novas funcionalidades. Não adianta construir o futuro sobre uma fundação instável.

### 4.2. Decisões de Arquitetura Chave

#### 4.2.1. Renderização Progressiva e Busca de Dados Desacoplada
**Status:** `Implementado`

Para aumentar a robustez e a performance percebida da aplicação, adotamos uma estratégia de busca de dados desacoplada, especialmente em funcionalidades complexas como a planta baixa.

1.  **Carregamento Primário (Essencial):** A busca principal de dados (ex: prédios, salas, itens) é mantida isolada e otimizada. Isso garante que a funcionalidade principal da página carregue de forma rápida e confiável, sem ser bloqueada por lógicas secundárias.
2.  **Enriquecimento no Cliente (Secundário):** Dados adicionais ou "enriquecimentos" visuais (como alertas de incidentes, status ao vivo, etc.) são buscados em uma segunda etapa, de forma assíncrona, no lado do cliente (`useEffect`).
3.  **Vantagens:**
    *   **Resiliência:** A interface principal funciona mesmo que a busca de dados secundários falhe.
    *   **UX Melhorada:** O usuário vê o conteúdo principal instantaneamente, e os dados adicionais aparecem em seguida (efeito de "pop-in"), o que pode até mesmo chamar a atenção para informações importantes de forma eficaz.

#### 4.2.2. Separação de Modais por Tipo de Entidade
**Status:** `Implementado`

Para resolver limitações de funcionalidade e melhorar a manutenibilidade, abandonamos o uso de um modal genérico para todos os tipos de itens. Agora, cada entidade principal possui seu próprio modal de detalhes, com campos e lógicas específicas.

*   **Modal de Itens da Planta (`ParentItems`):** Focado em atributos de localização (sala, coordenadas), dimensões e visualização de itens aninhados.
*   **Modal de Equipamentos Aninhados (`ChildItems`):** Focado em atributos de inventário (Nº de Série, Modelo) e, crucialmente, na capacidade de alterar seu **item pai** (ex: mover um servidor de um rack para outro).

Esta separação foi um passo fundamental para desbloquear o gerenciamento de inventário granular.

### 4.3. Fases do Projeto

O projeto está organizado em fases, permitindo o desenvolvimento incremental e a entrega contínua de valor.

#### Fase 1: Fundações e Gerenciamento de Dados
**Status:** `Concluído`
Construção do alicerce de dados da aplicação, incluindo as tabelas iniciais para prédios, salas e itens.

#### Fase 2: Visualização e Interação do Usuário
**Status:** `Concluído`
Criação da planta baixa interativa com suporte a movimentação, zoom e CRUD básico de itens.

#### Fase 3: Segurança e Controle de Acesso
**Status:** `Concluído`
Implementação de um sistema de segurança robusto com controle de acesso baseado em cargos (RBAC) e por prédios.

#### Fase 4: Ciclo de Vida e Integridade dos Dados
**Status:** `Concluído`
Implementação dos fluxos de trabalho que governam o ciclo de vida de um ativo, incluindo a lixeira e o sistema de status.

#### Fase 5: Inventário Hierárquico e Configurável
**Status:** `Concluído`
Separação estrutural dos dados em `ParentItems` e `ChildItems` no banco de dados e na interface, e criação da base para configuração de tipos de item na página de sistema.

#### Fase 6: Gerenciamento Avançado de Entidades e Atributos
**Status:** `Concluído`
Expansão da página `/system` com a criação e gerenciamento de Fabricantes e Modelos de equipamentos.

#### Fase 7: Fundações de Conectividade
**Status:** `Concluído`
Construção dos blocos fundamentais para o mapeamento de conexões físicas e lógicas, incluindo Tipos de Porta e Tipos de Conexão.

#### Fase 8: Mapeamento Avançado e Inteligência Proativa
**Status:** `Concluído`
Módulo central para mapear conexões e garantir a integridade dos data de forma proativa.

#### Fase 9: Logs, Aprovações e Visualizações Avançadas
**Status:** `Concluído`
Enriquecer a aplicação com camadas de dados visuais e fluxos de trabalho críticos.

#### Fase 10: Automação com IA e Relatórios
**Status:** `A Fazer`
Adicionar automação inteligente e capacidades de análise de dados.

#### Fase 11: Melhoria da Experiência do Usuário (UX)
**Status:** `Em Progresso`

1.  **11.1. Visualização de Rack Interativa:**
    *   **Status:** `Concluído`.
    *   **Descrição:** O modal de detalhes para racks agora exibe um diagrama visual interativo (`RackView`) que mostra todos os equipamentos aninhados ocupando suas respectivas posições (U's), permitindo uma gestão de espaço clara e precisa.

2.  **11.2. Alertas de Incidentes na Planta Baixa:**
    *   **Status:** `Concluído`.
    *   **Descrição:** Utilizando uma arquitetura de busca desacoplada, a planta baixa agora exibe um ícone de alerta sobre os racks (`ParentItems`) que contêm um incidente ativo, seja no próprio rack, em um equipamento aninhado ou em uma de suas conexões.

3.  **11.3. Gestão Completa de Portas de Equipamento:**
    *   **Status:** `Concluído`.
    *   **Descrição:** O modal de "Inventário de Portas" agora é totalmente interativo, permitindo aos usuários **adicionar**, **remover** (apenas se desconectada) e **desconectar** portas existentes, com diálogos de confirmação para garantir a segurança das operações.

---

## Desenvolvedor Principal

- **Nome:** Davidson Santos Conceição
- **Cargo (TIM):** Critical Mission Environment Operations Resident
- **Empresa Contratante:** Fundamentos Sistemas
- **Contatos:**
  - **E-mail Fundamentos:** `davidson.conceicao@fundamentos.com.br`
  - **E-mail TIM:** `dconceicao_fundamentos@timbrasil.com`
  - **E-mail Pessoal:** `davidson.php@gmail.com`
  - **Telefones:**
    - `+55 12 99732-4548`
    - `+55 91 98426-0688`
    - `+55 73 99119-9676`

---
*Atualização 31/08/2025 20:03 por Davidson Santos Conceição davidson.dev.br*
