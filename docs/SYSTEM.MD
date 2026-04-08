# Especificação de Interfaces – Protótipo Interativo (MVP CSC)

## 1. Objetivo

Definir a especificação de interfaces (UI/UX) para o protótipo interativo do sistema de Ticketing CSC, baseado em React + Vite, inspirado em ferramentas como ServiceNow e Run2Biz.

O objetivo é garantir:

* Navegação clara por papéis
* Alta eficiência operacional
* Baixa curva de aprendizado
* Aderência total ao fluxo do MVP definido

---

## 2. Princípios de Design

### 2.1 Diretrizes

* Interface orientada a fluxo (triagem → execução → fechamento)
* Informação crítica sempre visível (status, prioridade, SLA)
* Ações contextualizadas por papel
* Redução de cliques para tarefas frequentes
* Layout consistente entre páginas

### 2.2 Padrões visuais

* Layout com sidebar fixa
* Header com contexto + ações globais
* Conteúdo central em cards/tabelas
* Uso de cores para status/prioridade

---

## 3. Arquitetura de Navegação

### 3.1 Estrutura principal

Sidebar (fixa):

* Dashboard
* Tickets
* Aprovações
* Base de Conhecimento
* Admin (condicional)

Header:

* Busca global
* Notificações
* Perfil do usuário

---

## 4. Páginas e Interfaces

---

# 4.1 Dashboard

## Objetivo

Visão operacional rápida do trabalho.

## Componentes

### KPIs (topo)

* Tickets abertos
* SLA em risco
* Backlog
* CSAT médio (se disponível)

### Seções principais

#### Minha Fila

* Lista ou Kanban
* Filtros rápidos
* Ordenação por prioridade/SLA

#### Fila da Área

* Visível para membros
* Agrupamento por status

#### Visão Kanban

Colunas:

* New
* InTriage
* Assigned
* InProgress
* WaitingRequester
* Resolved

Interações:

* Drag and drop entre colunas
* Clique abre detalhe

---

# 4.2 Listagem de Tickets

## Objetivo

Gerenciamento completo dos tickets

## Componentes

### Barra de filtros

* Status
* Prioridade
* Área
* Atendente
* Data

### Tabela

Colunas:

* ID
* Título
* Status
* Prioridade
* Área
* Atendente
* SLA (tempo restante)
* Data de criação

### Ações

* Clique → detalhe
* Seleção múltipla (futuro)

---

# 4.3 Detalhe do Ticket

## Layout

Divisão em 3 áreas:

### 1. Header (fixo)

* ID + título
* Status (badge)
* Prioridade
* SLA countdown
* Botões de ação (dinâmicos por role)

Ações possíveis:

* Atribuir
* Mudar status
* Aprovar/Rejeitar
* Fechar
* Reabrir

---

### 2. Coluna esquerda (principal)

#### Timeline

* Criação
* Mudanças de status
* Comentários
* Aprovações
* Auditoria simplificada

#### Comentários

* Campo único (thread)
* Input com botão enviar

---

### 3. Coluna direita (sidebar)

#### Informações do ticket

* Solicitante
* Impactado
* Área
* Tipo
* Datas

#### Atribuição

* Assignee
* Botão de reatribuir

#### Anexos

* Lista
* Upload

---

# 4.4 Criar Ticket

## Fluxo

### Passo 1 – Seleção de serviço

* Lista ou busca
* Cards com descrição

### Passo 2 – Formulário

Campos:

* Título
* Descrição
* Tipo
* Usuário impactado
* Anexos

### Sugestões de KB

* Lista dinâmica baseada no serviço

### Ação

* Botão "Criar"

---

# 4.5 Aprovações

## Objetivo

Interface para aprovadores

## Lista

* Tickets aguardando aprovação

Colunas:

* Ticket
* Solicitante
* Serviço
* Data

## Detalhe rápido

* Drawer ou modal

## Ações

* Aprovar
* Rejeitar (com comentário obrigatório)

---

# 4.6 Base de Conhecimento (KB)

## Busca

* Input com autocomplete

## Lista de artigos

* Título
* Tags
* Serviço relacionado

## Detalhe

* Conteúdo em markdown

---

# 4.7 Admin

## Catálogo de Serviços

Tabela:

* Nome
* Impacto
* Urgência
* Requer aprovação
* Área

Ações:

* Criar
* Editar

## Áreas

* Lista de áreas
* Membros

---

## 5. Componentes Reutilizáveis

### 5.1 TicketCard

* ID
* Título
* Status
* Prioridade

### 5.2 StatusBadge

* Cores por status

### 5.3 PriorityBadge

* Low / Medium / High

### 5.4 SLAIndicator

* Tempo restante
* Cor (verde/amarelo/vermelho)

### 5.5 UserAvatar

* Nome + iniciais

---

## 6. Estados e Interações

### Loading

* Skeletons em listas

### Empty State

* Mensagens claras

### Error State

* Feedback amigável

---

## 7. Regras de UI Baseadas no Backend

* Status só muda via ações válidas
* Botões visíveis conforme role
* SLA sempre visível
* Campos obrigatórios no fechamento

---

## 8. Integração com Backend

### API Gateway

* Todas requisições via /api/v1

### Autenticação

* JWT via Keycloak

### Headers

* Authorization: Bearer token

---

## 9. Estrutura React (sugestão)

```
src/
 ├── pages/
 ├── components/
 ├── features/
 │    ├── tickets/
 │    ├── dashboard/
 │    ├── approvals/
 │    └── kb/
 ├── services/
 ├── hooks/
 ├── layouts/
 └── routes/
```

---

## 10. Considerações Finais

Este protótipo deve priorizar:

* Fluxo completo do ticket
* Clareza operacional
* Simplicidade (MVP-first)

Evoluções futuras:

* Formulários dinâmicos por serviço
* Automação de roteamento
* Chat interno
* Integração com IA

---

Fim do documento
