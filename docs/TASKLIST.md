# Tasklist de Implementação - Protótipo CSC

## Estrutura e Base Técnica
- [x] Inicialização do projeto com React + Vite + TypeScript
- [x] Configuração de TailwindCSS
- [x] Organização da arquitetura em páginas, features, componentes, layouts, hooks, services, store e rotas
- [x] Configuração de React Router, React Query e Zustand

## Modelo de Domínio e Simulação de Backend
- [x] Definição de tipos de domínio (tickets, usuários, serviços, KB, comentários, eventos)
- [x] Implementação de regras de transição de status por papel
- [x] Criação de base mock em memória
- [x] Criação de fake API assíncrona com delays simulados
- [x] Suporte a criação, listagem, detalhe e atualização de tickets
- [x] Suporte a atribuição, comentários e aprovações

## UI, Layout e Componentes
- [x] Layout principal com sidebar fixa e header
- [x] Componentes reutilizáveis (cards, badges, botões, tabela, inputs, modal)
- [x] Componentes de domínio (TicketCard, StatusBadge, PriorityBadge, SLAIndicator, UserAvatar, Timeline, CommentBox)
- [x] Modal de confirmação para ações críticas

## Páginas
- [x] Dashboard com KPIs e visões operacionais
- [x] Kanban operacional implementado por funcionário
- [x] Listagem de tickets com filtros
- [x] Detalhe do ticket em 3 colunas
- [x] Criação de ticket com anexos simulados e sugestões de KB
- [x] Aprovações com decisão e comentário obrigatório
- [x] Base de conhecimento com busca e renderização markdown
- [x] Admin mínimo para catálogo de serviços
- [x] Página de perfil para seleção de papel/usuário

## Regras de Permissão
- [x] Ajuste de navegação e rotas por papel
- [x] Requester com acesso somente a Tickets, Criar Ticket e KB
- [x] Requester visualiza apenas os próprios tickets
- [x] Agentes podem visualizar o Kanban
- [x] Apenas Supervisor/Admin podem mover tickets entre filas no Kanban

## UX e Interações
- [x] Confirmações de transição em português
- [x] Substituição de confirmações nativas por modal visual da aplicação
- [x] Feedback visual por toasts
- [x] Correção de sobreposição do quadro Kanban

## Tema
- [x] Implementação de tema claro/escuro automático conforme tema do sistema (prefers-color-scheme)
- [x] Ajuste de tokens visuais e fundo para ambos os temas

## Qualidade
- [x] Atualização de README com instruções e visão geral do protótipo
- [x] Validação com lint
- [x] Validação com build de produção
