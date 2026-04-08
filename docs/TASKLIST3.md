# TASKLIST 3 - ROADMAP DE EXCELÊNCIA DO PRODUTO

## 🧱 1. TELA DE LISTAGEM DE TICKETS (ONDE O SISTEMA VIVE)

Essa é a tela mais importante do produto. Hoje ela provavelmente está "ok". Precisa virar excelente.

### 🔥 Densidade de informação
Mostrar na linha do ticket:
- ID (ex: #1234)
- Título
- Status (badge)
- Prioridade (cor forte)
- Área
- Assignee (avatar)
- SLA (contador ou badge)
- Última atualização ("há 5 min")

### 🎨 Hierarquia visual
**Prioridade:**
- High = destaque forte (não tímido)

**SLA:**
- normal / risco / vencido (3 estados visuais claros)

### ⚡ Interação rápida
Hover na linha → mostrar ações:
- atribuir para mim
- mudar status
- abrir preview

Click não precisa abrir página:
- suportar drawer lateral (preview rápido)

### 🔍 Filtros poderosos (nível produto real)
- Filtros persistentes (salvos no estado)
- Multi-filtro:
  - status
  - prioridade
  - área
  - assignee
  - período
- Filtros rápidos (chips):
  - "Meus"
  - "Sem dono"
  - "Em atraso"

### 📊 Modo alternativo
Toggle:
- tabela
- kanban

---

## 🧾 2. TELA DE DETALHE DO TICKET (CORE ABSOLUTO)

Se essa tela não for muito boa, o sistema perde valor.

### 🧠 Estrutura ideal (3 colunas mentalmente)

**🟦 Header (fixo)**
- ID + título
- Status (editável via ação, não dropdown livre)
- Botões principais:
  - atribuir
  - iniciar
  - resolver
  - fechar

**🟨 Coluna principal (timeline)**
Timeline unificada:
- comentários
- mudanças de status
- atribuições
- sistema

Cada item deve mostrar:
- avatar
- nome
- timestamp relativo
- tipo de evento

**🟩 Sidebar (inteligente)**
Blocos:
- prioridade
- SLA (com contador)
- área
- assignee
- requester / affected
- datas (created, updated)

### 💬 Comentários (refinar MUITO)
- Input sempre visível (fixo)
- Suporte a:
  - anexos
  - @menção (mesmo fake no MVP)
- Diferenciar visualmente:
  - comentário normal
  - ação do sistema

### ⚡ Ações contextuais
Mostrar ações baseadas no status:
- New → "Iniciar triagem"
- Assigned → "Começar"
- InProgress → "Resolver"

👉 Isso evita erro e melhora UX absurdamente

### ⏳ SLA (isso precisa brilhar)
Mostrar:
- tempo restante
- barra visual
- estado (ok / risco / estourado)

---

## 🧩 3. CRIAÇÃO DE TICKET (PRECISA SER GUIADA)

Hoje geralmente fica "form básico". Isso é um erro.

### 🧩 Fluxo em etapas (melhora MUITO UX)
- Step 1: escolher serviço (catálogo)
- Step 2: preencher dados
- Step 3: revisão

### 🧠 Inteligência durante criação
Ao escolher serviço:
- mostrar:
  - descrição
  - SLA esperado
  - se precisa aprovação

Durante digitação:
- sugerir artigos da KB

### 📎 UX de anexos
- Drag & drop
- Preview de arquivos

---

## 📊 4. DASHBOARD (HOJE DEVE ESTAR FRACO)

Dashboard ruim = produto parece fraco.

### 📈 KPIs com contexto
Cards:
- Abertos
- Em andamento
- Em atraso
- Resolvidos hoje

### 📉 Visualização simples
Gráfico:
- volume por dia

Distribuição:
- por status
- por prioridade

### 🎯 Foco no usuário
- Se Agent: "Meus tickets"
- Se Manager: visão por área

---

## ✅ 5. TELA DE APROVAÇÕES (SIMPLES, MAS AFIADA)

### 📋 Lista clara
Mostrar:
- ticket
- solicitante
- motivo
- tempo esperando

### ⚡ Decisão rápida
Botões inline:
- Aprovar
- Rejeitar

Rejeição abre modal obrigatório

---

## 📚 6. KB (PARECE SIMPLES, MAS DEFINE MATURIDADE)

### 🔍 Busca de verdade
- Input grande, central
- Highlight de termos encontrados

### 📄 Leitura
- Markdown bem formatado
- Sidebar com:
  - tags
  - serviços relacionados

### 🔗 Integração com tickets
- Mostrar artigos relacionados no ticket

---

## 🎨 7. POLIMENTO VISUAL (ALTO IMPACTO)

Aqui você sai de MVP → produto sério.

### 🎯 Consistência
Padronizar:
- cores de status
- cores de prioridade
- espaçamento

### 🧱 Componentização
Criar componentes reutilizáveis:
- Badge
- Avatar
- TicketCard
- SLAIndicator

### 🪶 Microinterações
- Hover states
- Loading skeletons
- Transições suaves

### 🕳 Estados vazios
- Nunca deixar tela "em branco"
- Sempre orientar o usuário

---

## ⚠️ 8. ERROS CLÁSSICOS QUE VOCÊ DEVE EVITAR

Direto ao ponto:

1. **Tela de detalhe sem timeline rica** → produto morre
2. **Lista sem SLA visível** → perde valor operacional
3. **Ações livres demais** → quebra o fluxo do sistema
4. **Formulário sem guia** → usuário erra tudo
5. **UI "flat demais"** → parece sistema interno mal feito
