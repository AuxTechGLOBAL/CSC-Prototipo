# CSC Service Desk - Frontend Prototype (MVP)

Protótipo interativo de um sistema de Ticketing/Service Desk corporativo, construído para simular fluxo operacional real sem backend.

## Stack

- React + Vite + TypeScript
- TailwindCSS (via @tailwindcss/vite)
- shadcn/ui style components (base UI em src/components/ui)
- React Query (simulação de chamadas assíncronas)
- Zustand (estado global leve)
- React Router
- Sonner (toasts)
- React Markdown (KB)

## Como executar

```bash
npm install
npm run dev
```

Build de produção:

```bash
npm run build
```

Lint:

```bash
npm run lint
```

## Funcionalidades implementadas

- Dashboard com KPIs, fila pessoal, fila da área e Kanban com drag and drop
- Listagem de tickets com filtros por status, prioridade, área e atendente
- Detalhe do ticket em 3 colunas:
  - Header com status, prioridade, SLA e ações dinâmicas
  - Timeline e comentários
  - Sidebar com dados, atribuição e anexos mock
- Criação de ticket com seleção de serviço, formulário e anexos simulados
- Aprovações com decisão de aprovar/rejeitar e comentário obrigatório
- Base de conhecimento com busca e renderização markdown
- Admin mínimo para CRUD de catálogo de serviços (criar/remover)
- Simulação de papéis (Requester, Agent, Approver, Supervisor, Admin) com troca via header

## Estados de ticket suportados

- New
- InTriage
- AwaitingApproval
- Assigned
- InProgress
- WaitingRequester
- Resolved
- Closed
- Cancelled

Transições são controladas por role em src/lib/workflow.ts.

## Fake API e dados mock

- Dados em memória em src/services/mockDb.ts
- Camada assíncrona com delay em src/services/fakeApi.ts
- Operações simuladas:
  - CRUD de tickets (criação/listagem/detalhe)
  - Mudança de status com validação de workflow
  - Atribuição
  - Aprovação/Rejeição
  - Comentários
  - SLA por prazo (dueAt)

## Estrutura do projeto

```txt
src/
 ├── pages/
 ├── features/
 │    ├── tickets/
 │    ├── dashboard/
 │    ├── approvals/
 │    └── kb/
 ├── components/
 ├── layouts/
 ├── hooks/
 ├── services/
 ├── store/
 └── routes/
```

## Observações

- Este projeto não possui backend real.
- Os dados permanecem em memória durante a sessão do navegador.
- A arquitetura foi preparada para migração futura para API real, mantendo separação de camadas (UI, estado, serviço).
