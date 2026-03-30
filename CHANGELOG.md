# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

## [2026-03-30] - Independência e Self-Hosted Total

### Adicionado
- Scripts IaC (Ansible) na pasta `ansible/` para deploy automatizado em Proxmox LXC e servidores Linux genéricos.
- Nova interface de Login nativa.
- Motor de API PostgREST para comunicação direta e rápida com o banco de dados.
- MinIO adicionado como solução S3 Self-Hosted para armazenamento de imagens.

### Modificado
- Migração completa de infraestrutura: Firebase e Azure Blob Storage removidos em favor do PostgreSQL e MinIO locais (100% Self-Hosted).
- Autenticação refatorada para usar NextAuth com `CredentialsProvider` e banco próprio.
- Geração de IDs de usuário alterada para o nativo `crypto.randomUUID()`.
- Compilação do Next.js ajustada para `output: 'standalone'`, otimizando a imagem Docker.
- Variáveis de ambiente consolidadas e simplificadas.

### Corrigido
- Loop infinito de redirecionamento na rota de login (`/login1` para `/login`).
- Bug de permissões corrigido garantindo a role `developer` para o usuário semente gerado via IaC.


## [Não Liberado]

### Mudança Estratégica
- **Filosofia de Desenvolvimento Formalizada:** Adotada e documentada a filosofia de que a **estabilidade e a correção de bugs têm prioridade** sobre o desenvolvimento de novas funcionalidades, garantindo uma base de código mais robusta.
- **Refatoração do Sistema de Autenticação:** O método de login foi unificado para usar exclusivamente **E-mail e Senha**. A autenticação via Microsoft foi removida para simplificar o fluxo de desenvolvimento, depuração e dar controle total sobre o ciclo de vida do usuário.
- **Página Inicial:** A "Central de Evidências" (/evidence) foi definida como a nova página principal da aplicação, focando o fluxo de trabalho na coleta de dados operacionais.
- **Arquitetura de Busca Desacoplada:** Implementada uma nova arquitetura de busca de dados para a planta baixa. O carregamento dos itens da planta foi separado da busca por dados secundários (como alertas de incidentes), aumentando drasticamente a resiliência e a performance percebida da funcionalidade principal.
- **Separação de Modais de Detalhes:** O modal de detalhes genérico foi abandonado em favor de modais especializados: um para "Itens da Planta" (`parent_items`) e outro para "Equipamentos Aninhados" (`child_items`). Essa separação foi crucial para desbloquear funcionalidades de inventário, como mover um equipamento entre racks.

### Adicionado
- **Central de Evidências:** Implementada a nova página `/evidence` como o ponto central de entrada de dados operacionais, com suporte a múltiplas fotos via upload de arquivo ou uso da câmera do dispositivo. A página foi otimizada para uso em dispositivos móveis.
- **Estrutura de Relatórios e Exportação:**
    - Criada a estrutura da página `/reports` com seções para "Relatório Completo (PDF/Impressão)", "Exportar para Excel" e um "Assistente de Relatórios IA".
    - Implementada a funcionalidade completa de **Exportação para Excel**, que exporta dados de inventário (itens, equipamentos, conexões) para um arquivo .xlsx com cabeçalhos de coluna formatados.
- **Perfil de Usuário e Preferências:**
    - Adicionada a página `/profile`, permitindo ao usuário editar seu nome de exibição, foto de perfil e assinatura digital.
    - Implementado o fluxo seguro para o usuário alterar a própria senha diretamente na página de perfil.
    - Adicionada a página `/settings` onde o usuário pode customizar sua experiência, como ocultar itens do menu de navegação.
- **Funcionalidades de Gerenciamento Avançado:**
    - **Diagrama de Rack Interativo (`RackView`):** O modal de detalhes para itens do tipo "Rack" agora exibe uma visualização gráfica mostrando os equipamentos aninhados em suas respectivas posições U.
    - **Gerenciamento de Portas no Modal:** O modal de "Inventário de Portas" agora é totalmente interativo, permitindo ao usuário desconectar uma porta ativa, adicionar uma nova porta, ou excluir uma porta existente (se não estiver conectada).
    - **Log de Auditoria Interativo:** A página `/audit` foi transformada de uma lista estática em um painel interativo. Clicar em uma linha de log agora abre um modal com os detalhes completos da entidade relacionada (item, aprovação, etc.).
- **Alertas Visuais:**
    - **Alertas de Incidentes na Planta Baixa:** Implementado um sistema de alertas visuais (`AlertTriangle`) que aparece sobre os itens da planta baixa que contêm um incidente ativo.
    - **Notificação de Aprovações Pendentes:** Um indicador visual foi adicionado ao menu de navegação para alertar os supervisores sobre solicitações de aprovação pendentes.
- **Ferramentas de Desenvolvedor:**
    - O "Dev Menu" foi refatorado para ter botões granulares para popular dados essenciais (catálogo) e dados de teste de forma separada e segura.
    - Adicionado um botão para limpar o log de auditoria, facilitando a depuração.
    - Criada a página de "Hub do Banco de Dados" (`/teste-db`) para centralizar as ações de setup e inspeção do schema.

### Melhorado
- **Ciclo de Vida de Ativos e Fluxo de Aprovações:** Formalizada e implementada uma lógica rigorosa onde qualquer mudança de status em um item (ex: de 'Rascunho' para 'Ativo') gera uma solicitação que deve ser aprovada por um supervisor. Itens ativos são bloqueados contra movimentação acidental para garantir a integridade dos dados.
- **Fluxo de Desconexão:** A lógica de desconexão de cabos foi aprimorada. Desconectar apenas um lado de um cabo agora cria corretamente um incidente de "Conexão Não Resolvida", que pode ser solucionado diretamente pela Central de Incidentes.
- **"Humanização" do Log de Auditoria:** Os logs brutos foram traduzidos para um formato legível, exibindo nomes em vez de IDs e descrevendo as ações de forma clara (ex: "Item movido da posição C3 para D3").
- **Otimização Global de Imagens:** Implementado um processo de otimização (redimensionamento e compressão) em todo o sistema. Todas as imagens (fotos de perfil, assinaturas, evidências) são tratadas no cliente antes do upload.
- **Robustez do Schema do Banco de Dados:** A função `_ensureDatabaseSchema` foi aprimorada para verificar e adicionar colunas faltantes em tabelas existentes, garantindo que o banco de dados esteja sempre sincronizado com o código.
- **Usabilidade do Formulário:** Os seletores de Fabricante e Modelo no formulário de adição de equipamento foram transformados em comboboxes pesquisáveis, melhorando a experiência do usuário.

### Corrigido
- **Corrigida Falha Crítica de Carregamento da Planta Baixa:** Resolvido o problema recorrente onde a planta baixa não carregava as salas disponíveis. A nova arquitetura de busca de dados desacoplada solucionou a causa raiz do problema.
- **Corrigida Falha de Conexão Unilateral:** A tabela `Connections` foi corretamente alterada para permitir valores `NULL` na coluna `port_b_id`, possibilitando o registro de conexões não resolvidas.
- Resolvido erro "Maximum update depth exceeded" que causava um loop infinito de renderização.
- Corrigida a `server action` `updateItem` que não salvava as posições `x` ou `y` quando eram `0`.
- Corrigido o erro "Usuário não autenticado" ao salvar a posição de um item.
- Corrigidos múltiplos erros de hidratação e "Module not found" durante o build para deploy.

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
