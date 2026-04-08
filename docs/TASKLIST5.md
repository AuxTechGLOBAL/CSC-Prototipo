# TASKLIST 5 - Análise: O que ainda FALTA (MVP vs. Produto Real)

## 🔴 1. O que provavelmente ainda FALTA (CRÍTICO pro MVP)

Esses são itens que não são opcionais — sem eles, o frontend não cobre o escopo definido.

### 1.1 Timeline/Audit visual do ticket

Você menciona **auditoria obrigatória**, mas normalmente o frontend esquece isso.

**Falta:**
- Timeline completa no detalhe do ticket:
  - mudança de status
  - atribuições
  - comentários
  - aprovações/rejeições
- Diferenciar visualmente:
  - comentário
  - mudança de status
  - sistema vs usuário

**👉 Sem isso, você quebra um dos pilares do sistema (auditabilidade).**

**Status:** ⬜ Não iniciado

---

### 1.2 Ações de workflow (estado do ticket)

O sistema tem estados bem definidos, então o frontend precisa refletir isso.

**Falta comum:**
- Botões contextuais por status:
  - "Assumir"
  - "Iniciar"
  - "Resolver"
  - "Fechar"
  - "Reabrir"
- Controle por role (Agent, Approver, etc.)

**👉 Se hoje é só edição de status genérica, está errado pro modelo.**

**Status:** ⬜ Não iniciado

---

### 1.3 Tela de Aprovação (decente)

Existe **fluxo de aprovação**.

**Falta comum:**
- Lista clara de aprovações pendentes
- Tela com:
  - contexto do ticket
  - botões:
    - Aprovar
    - Rejeitar (com comentário obrigatório)

**Status:** ⬜ Não iniciado

---

### 1.4 Criação de ticket com contexto do catálogo

Você definiu que o **catálogo dirige o ticket**.

**Falta comum:**
- UX decente de seleção de serviço:
  - busca
  - categorias
- Exibir:
  - impacto/urgência derivados
  - sugestões de KB

**Status:** ⬜ Não iniciado

---

### 1.5 Fechamento correto (com obrigatoriedade)

Regra clara: precisa de `CloseReason` e `SolutionSummary`

**Falta comum:**
- Modal de fechamento com:
  - campos obrigatórios
  - validação

**Status:** ⬜ Não iniciado

---

### 1.6 Upload e visualização de anexos

Existe suporte a **anexos**.

**Falta comum:**
- Upload drag & drop
- Lista de anexos no ticket
- Preview (mínimo)

**Status:** ⬜ Não iniciado

---

## 🟡 2. O que falta pra UX ficar realmente boa

Aqui entra o que diferencia "funciona" de "produto bom".

### 2.1 Kanban de verdade (não só visual)

Você mencionou **kanban**.

Mas normalmente falta:
- Drag & drop entre colunas
- Atualização de status ao mover
- WIP awareness (ex: quantidade por coluna)

**Status:** ⬜ Não iniciado

---

### 2.2 Filtros persistentes e usáveis

Você tem **filtros**, mas…

**Falta comum:**
- salvar filtros (ex: "Meus tickets abertos")
- filtros rápidos:
  - "Alta prioridade"
  - "Atrasados (SLA)"
- busca textual

**Status:** ⬜ Não iniciado

---

### 2.3 Indicadores de SLA no UI

**SLA é core do sistema**

**Falta comum:**
- badge visual:
  - 🟢 dentro do SLA
  - 🟡 perto de estourar
  - 🔴 estourado
- countdown (tempo restante)

**Status:** ⬜ Não iniciado

---

### 2.4 Diferenciação de comentários

Você tem `IsInternal`

Mesmo que no MVP seja simples:

**Ideal:**
- comentário público vs interno (visualmente diferente)
- avatar + role

**Status:** ⬜ Não iniciado

---

### 2.5 Empty states decentes

Quase sempre ignorado:
- "Você não tem tickets atribuídos"
- "Nenhuma aprovação pendente"

**👉 Isso muda muito percepção de qualidade.**

**Status:** ⬜ Não iniciado

---

## 🟢 3. O que falta pra ficar "nível ServiceNow-lite"

Aqui é onde seu produto começa a ficar realmente forte.

### 3.1 Sugestão de KB durante criação

Você já previu isso.

Mas no frontend precisa:
- mostrar artigos enquanto digita
- evitar abertura de ticket (deflexão)

**Status:** ⬜ Não iniciado

---

### 3.2 Quick actions

No detalhe do ticket:
- atribuir a mim
- mudar prioridade (se permitido)
- mover de área

**Status:** ⬜ Não iniciado

---

### 3.3 Visão por persona

Hoje geralmente tudo fica igual pra todos.

Mas seu modelo tem **roles**:

**👉 Ideal:**
- Requester vê interface simplificada
- Agent vê operacional
- Manager vê métricas

**Status:** ⬜ Não iniciado

---

### 3.4 Dashboard útil (não só número)

Você tem **KPI**.

Mas falta:
- gráficos simples:
  - tickets por status
  - SLA compliance
- atalhos acionáveis:
  - "5 tickets atrasados → clicar e ver lista"

**Status:** ⬜ Não iniciado

---

### 3.5 Reabertura guiada

Existe regra de **48h**

Frontend deveria:
- mostrar botão só quando permitido
- explicar motivo se não puder

**Status:** ⬜ Não iniciado

---

## 🧠 Resumo direto

Se eu tivesse que resumir o que mais falta no seu protótipo hoje:

### 🔴 Essencial (BLOQUEADORES DO MVP)
- [ ] Timeline completa (audit log visível)
- [ ] Ações de workflow por status
- [ ] Aprovação funcional
- [ ] Fechamento com validação
- [ ] Upload de anexos

### 🟡 UX (Melhoria significativa, antes de produção)
- [ ] SLA visual
- [ ] filtros bons
- [ ] kanban interativo
- [ ] comentários bem diferenciados

### 🟢 Evolução (Após MVP)
- [ ] sugestão de KB
- [ ] dashboards úteis
- [ ] experiência por role
