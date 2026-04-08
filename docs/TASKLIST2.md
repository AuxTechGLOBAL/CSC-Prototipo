# Tasklist de Evolucao MVP - CSC

## 1. Correcoes Obrigatorias (alinhamento com MVP)

### Fluxo de status (critico)
- [x] Restringir alteracao de status a transicoes permitidas por estado + role
- [x] Exibir apenas acoes validas por contexto (ex.: Start Progress, Resolve, Close)
- [x] Bloquear transicoes invalidas na UI e na fake API

### Primeira resposta (FirstResponseAt)
- [x] Registrar FirstResponseAt na primeira atribuicao do ticket
- [x] Exibir indicador visual de primeira resposta pendente no detalhe
- [x] Exibir timestamp quando a primeira resposta ja foi registrada

### Fechamento com campos obrigatorios
- [x] Exigir modal de fechamento com CloseReason e SolutionSummary
- [x] Impedir fechamento sem preenchimento dos dois campos
- [x] Persistir os campos no ticket e registrar evento de fechamento

### Criacao de ticket por catalogo
- [x] Impedir abertura sem selecao de servico
- [x] Exibir impacto e urgencia herdados do servico como somente leitura
- [x] Manter prioridade derivada do servico no backend mock

### Visibilidade por role
- [x] Requester: visualizar apenas tickets proprios
- [x] Agent: visualizar fila da propria area + tickets atribuidos
- [x] Supervisor: visao ampliada
- [x] Admin: visao total
- [x] Reforcar regra de visibilidade no detalhe do ticket

## 2. Melhorias de UX (onde mais gera valor)

### Navegacao e estrutura
- [x] Revisar sidebar final para conter Dashboard, Tickets, Aprovacoes, KB e Admin por role
- [x] Adicionar breadcrumb no detalhe do ticket

### Lista de tickets
- [x] Destacar prioridade com cores consistentes
- [x] Reforcar badges de status
- [x] Destacar SLA em risco/vencido
- [x] Adicionar filtros rapidos: Meus tickets, Nao atribuidos, Em atraso

### Detalhe do ticket
- [x] Consolidar layout em secoes: Header, Infos, Timeline e Sidebar
- [x] Diferenciar visualmente eventos de comentario, mudanca de status e atribuicao

### Comentarios
- [x] Tornar input de comentario fixo no rodape da area principal
- [x] Diferenciar comentarios de sistema vs usuario
- [x] Evoluir estrutura para uso de IsInternal

## 3. Funcionalidades faltantes do MVP

### Kanban
- [x] Garantir colunas: New, InTriage, Assigned, InProgress, Waiting, Resolved
- [x] Avaliar drag and drop no MVP

### Aprovacoes
- [x] Validar tela de pendentes de aprovacao
- [x] Reforcar rejeicao com comentario obrigatorio

### Anexos
- [x] Upload na criacao
- [x] Upload no comentario
- [x] Listagem no detalhe

### Base de Conhecimento
- [x] Busca simples
- [x] Lista de artigos
- [x] Tela de leitura
- [x] Sugestoes de artigos ao abrir ticket

### Dashboard
- [x] Exibir KPIs minimos: total aberto, backlog, SLA compliance

### Feedback visual
- [x] Exibir mensagens de estado de atualizacao e aprovacao

## 4. Extras de alto impacto
- [x] Quick actions no ticket (Atribuir para mim, Mover para minha area, Resolver)
- [x] Sugestao inteligente de KB ao digitar titulo/descricao
- [x] Tags visuais (tipo, prioridade, area)
- [x] Empty states refinados
- [x] SLA visual com barra ou contador (verde/amarelo/vermelho)

## Ordem recomendada de execucao
1. Fluxo de status + acoes (critico)
2. Tela de detalhe (timeline + acoes)
3. Lista com filtros eficientes
4. Criacao de ticket correta (catalogo)
5. Aprovacoes
6. Dashboard / Kanban
7. KB
