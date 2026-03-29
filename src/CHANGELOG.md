# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

## [Lançado]

### Mudança Estratégica
- **Filosofia de Desenvolvimento Formalizada:** A documentação do projeto foi atualizada para refletir a filosofia de que a estabilidade e a correção de bugs têm prioridade.
- **Refatoração do Sistema de Autenticação:** Unificado o método de login para usar exclusivamente E-mail e Senha.
- **Página Inicial:** A "Central de Evidências" (/evidence) foi definida como a nova página principal da aplicação.

### Adicionado
- **Plataforma de Inteligência Assistida (Scanner de Vídeo):**
  - **Captura Contínua por Vídeo:** Implementada a funcionalidade de "Scanner de Vídeo" na página `/import`. A aplicação agora captura frames de vídeo automaticamente, enviando-os para análise da IA em tempo real.
  - **Feedback Instantâneo:** A interface do scanner foi aprimorada para exibir uma lista dos itens capturados em tempo real, permitindo que o usuário acompanhe o progresso da análise.
  - **Seleção de Câmera:** O usuário agora pode escolher entre as câmeras disponíveis no dispositivo (frontal/traseira), otimizando a experiência para uso em celulares.
- **Central de Evidências Unificada:**
  - Implementada a página `/evidence` como o novo ponto central da aplicação.
  - Adicionado formulário para registro de "Evidências Gerais", que não estão atreladas a um item ou incidente específico.
  - Implementado um novo card na página de evidências que exibe um "Histórico de Evidências de Incidentes".
- **Gerenciamento de Salas Irregulares:**
  - Implementada a arquitetura de "Zonas de Exclusão", permitindo modelar formatos de sala complexos (L, U, etc.).
  - A planta baixa agora renderiza visualmente essas zonas e impede o posicionamento de itens sobre elas.
- **Diagrama de Rack Interativo:** O modal de detalhes para "Racks" agora exibe uma visualização gráfica (`RackView`) interativa.
- **Alertas de Incidentes na Planta Baixa:** Implementado um sistema de alertas visuais sobre racks que contêm problemas ativos.
- **Gerenciamento de Portas no Modal:** O modal de "Inventário de Portas" agora é totalmente funcional, permitindo adicionar, remover e desconectar portas.

### Melhorado
- **Robustez da IA:** O prompt da IA foi refinado para focar exclusivamente em OCR de etiquetas e dados de equipamentos, ignorando outros elementos da imagem e melhorando a precisão. A comunicação com a API foi estabilizada ao trocar a expectativa de um JSON rígido por uma análise de texto estruturado.
- **Usabilidade da Página de Importação:** A página `/import` agora é mais intuitiva, alterando dinamicamente os títulos, descrições e exemplos de dados conforme o tipo de importação selecionado pelo usuário (Equipamentos, Racks ou Conexões).
- **Schema de Banco de Dados:** A tabela `Evidence` foi refatorada para ser mais genérica, permitindo que evidências sejam associadas a qualquer tipo de entidade no futuro.
- **Arquitetura de Carregamento da Planta Baixa:** A busca de dados da planta foi desacoplada de dados secundários (como alertas), aumentando a robustez e a performance percebida.
- **Separação de Modais de Detalhes:** O modal de detalhes foi dividido em `ParentItems` e `ChildItems` para permitir funcionalidades específicas, como mover equipamentos entre racks.
- **Fluxo de Desconexão:** Desconectar um lado de um cabo agora cria corretamente um incidente de "Conexão Não Resolvida", que pode ser solucionado via Central de Incidentes.
- **Otimização de Imagens:** Implementado processo de otimização de imagem no cliente para todas as imagens enviadas.
- **Robustez do Schema do Banco de Dados:** A função `_ensureDatabaseSchema` foi aprimorada para verificar e adicionar colunas faltantes em tabelas existentes.

### Corrigido
- **Erros de API da IA (400 Bad Request):** Corrigido erro crítico que impedia a análise de imagens pela IA, ajustando o schema de resposta esperado.
- **Erro de Sintaxe do Genkit:** Corrigido o erro de runtime "text is not a function" ao atualizar a chamada para a propriedade `text` da resposta da IA.
- **Falha Crítica ao Salvar Evidências:** Corrigido o erro que impedia o salvamento de evidências devido a um desalinhamento entre o schema do banco de dados e a `server action`.
- **Corrigida Falha Crítica de Carregamento da Planta Baixa:** Resolvido o problema recorrente onde a planta baixa não carregava as salas disponíveis.
- **Corrigida Falha de Conexão Unilateral:** A tabela `Connections` foi corretamente alterada para permitir valores `NULL` na coluna `portB_id`.
- Resolvido erro "Maximum update depth exceeded" que causava um loop infinito de renderização.
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
