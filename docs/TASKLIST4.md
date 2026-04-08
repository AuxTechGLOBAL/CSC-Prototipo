# TASKLIST 4 - FLOW BUILDER VISUAL (PROCESS BUILDER)

## 1. Conceito da feature

### Objetivo
Criar um Process Builder visual para fluxo de tickets no estilo BPMN simplificado (inspirado em Zapier, n8n e ServiceNow Flow Designer).

### Escopo MVP
Permitir configurar fluxo como:
Start -> Triagem -> Aprovacao? -> Execucao -> Encerramento

Com suporte a:
- decisoes
- automacoes basicas
- atribuicoes

### Resultado esperado
- [ ] Usuario consegue montar fluxo completo em canvas visual
- [ ] Usuario consegue editar configuracoes de cada node
- [ ] Usuario consegue validar e publicar fluxo

---

## 2. Layout da tela

### Estrutura geral
- Header
- Sidebar de nodes (paleta)
- Canvas principal (flow builder)
- Properties Panel dinamico (parte inferior)

### Header
- [ ] Campo de nome do fluxo
- [ ] Botao Salvar
- [ ] Botao Publicar
- [ ] Botao Testar (fake)
- [ ] Indicador de status: Draft / Published

### Sidebar de nodes
Categorias:
- Basicos: Start, End
- Fluxo: Status Change, Assign, Wait
- Logica: Condition (if/else), Approval
- Sistema (MVP): Send Notification

Checklist:
- [ ] Sidebar com categorias visuais claras
- [ ] Itens arrastaveis para o canvas
- [ ] Tooltip breve por node

### Canvas
- [ ] Grid visual
- [ ] Zoom in/out
- [ ] Pan no canvas
- [ ] Drag and drop de nodes
- [ ] Conexao entre nodes por edges
- [ ] Setas/conexoes animadas

### Properties Panel (dinamico)
- [ ] Abre ao selecionar node
- [ ] Exibe propriedades por tipo de node
- [ ] Atualiza node em tempo real

---

## 3. Tipos de nodes (MVP)

### Start Node (fixo)
- [ ] Node inicial obrigatorio
- [ ] Nao deletavel
- [ ] Exatamente 1 Start

### Status Change Node
Config:
- Novo status:
  - InTriage
  - Assigned
  - InProgress
  - Resolved
  - Closed

Checklist:
- [ ] Select de status no painel
- [ ] Label dinamica no node (ex.: "Mudar para InProgress")

### Assign Node
Config:
- Tipo:
  - usuario especifico
  - por area
  - quem pegar

Checklist:
- [ ] Modo de atribuicao selecionavel
- [ ] Campos dinamicos por modo

### Condition Node (IF)
Config:
- Campo: prioridade / tipo / area
- Operador: equals / greater than
- Valor

Saidas:
- TRUE
- FALSE

Checklist:
- [ ] Duas saidas visuais obrigatorias
- [ ] Labels de saida (TRUE/FALSE)

### Approval Node
Config:
- Approver: usuario ou role
- Timeout opcional

Saidas:
- Approved
- Rejected

Checklist:
- [ ] Duas saidas obrigatorias
- [ ] Configuracao de aprovador no painel

### End Node
- [ ] Node final obrigatorio
- [ ] Exatamente 1 End

---

## 4. Interacoes (UX de verdade)

### Drag and drop
- [ ] Arrastar node da sidebar para o canvas
- [ ] Posicionamento com snap simples no grid

### Conexoes
- [ ] Conectar node para node via handles
- [ ] Edge com estado visual de selecao
- [ ] Edge animada para fluxo ativo

### Edicao
- [ ] Clique no node abre painel inferior
- [ ] Node selecionado com highlight
- [ ] Botao de exclusao para nodes permitidos

### Feedback visual
- [ ] Node invalido com borda vermelha
- [ ] Aviso de fluxo incompleto no topo
- [ ] Mensagem de sucesso ao salvar/publicar

### Adicao rapida
- [ ] Botao "+" entre nodes para inserir passo

### Navegacao
- [ ] Zoom controls
- [ ] Fit view
- [ ] Pan com mouse

---

## 5. Estados e regras do front

### Modelo de estado
```ts
type Flow = {
  id: string
  name: string
  status: 'Draft' | 'Published'
  nodes: FlowNode[]
  edges: FlowEdge[]
  updatedAt: string
}
```

### Validacoes obrigatorias
- [ ] Deve existir 1 Start
- [ ] Deve existir 1 End
- [ ] Nodes desconectados -> erro
- [ ] Condition sem 2 saidas -> erro
- [ ] Approval sem 2 saidas -> erro
- [ ] Node sem configuracao minima -> erro

### Indicadores
- [ ] Banner "Fluxo invalido"
- [ ] Badge "Nao publicado"
- [ ] Badge "Publicado"

### Persistencia local (MVP)
- [ ] Salvar estado em store local
- [ ] Restaurar ultimo draft ao abrir pagina

---

## 6. Estrutura React sugerida

### Bibliotecas
- [ ] reactflow (canvas, nodes, edges, zoom/pan)
- [ ] zustand (estado do flow builder)
- [ ] UI base ja existente do projeto (componentes atuais)

### Estrutura de componentes
- [ ] FlowBuilderPage
- [ ] FlowBuilderHeader
- [ ] NodeSidebar
- [ ] FlowCanvas
- [ ] PropertiesPanel
- [ ] ValidationBanner

### Estrutura de pasta sugerida
- [ ] src/features/flow-builder/components/
- [ ] src/features/flow-builder/nodes/
- [ ] src/features/flow-builder/store/
- [ ] src/features/flow-builder/types/
- [ ] src/pages/flow-builder-page.tsx

### Contratos basicos
- [ ] NodeComponent generico com props: type, label, valid
- [ ] Switch de painel por tipo de node

---

## 7. UI/UX diferencial

### Identidade visual por tipo
- [ ] Azul = fluxo
- [ ] Roxo = logica
- [ ] Amarelo = decisao
- [ ] Verde = inicio/fim

### Labels claros
Exemplos:
- [ ] "Se prioridade = Alta"
- [ ] "Aprovacao do gestor"
- [ ] "Atribuir para area Financeiro"

### Microinteracoes
- [ ] Hover glow em node
- [ ] Selecao com sombra destacada
- [ ] Transicao suave no painel de propriedades

### Legibilidade e simplicidade
- [ ] Layout clean, sem tentar BPMN completo
- [ ] Foco em clareza de fluxo

---

## 8. API fake e testes do MVP

### Acoes fake
- [ ] Salvar fluxo (mock)
- [ ] Publicar fluxo (mock)
- [ ] Testar fluxo (mock de simulacao)

### Testes minimos
- [ ] Criar fluxo valido com Start/End
- [ ] Bloquear publicacao com fluxo invalido
- [ ] Garantir render dos paineis por tipo
- [ ] Garantir que conectar/desconectar atualiza validacao

---

## 9. Roadmap de execucao (ordem recomendada)

1. Base tecnica
- [ ] Instalar e configurar React Flow
- [ ] Criar tipos de node/edge + store

2. Estrutura de tela
- [ ] Header, Sidebar, Canvas, Properties Panel

3. Nodes MVP
- [ ] Start, End, Status Change, Assign, Condition, Approval

4. Conexoes e navegacao
- [ ] Drag, connect, zoom, pan, fit view

5. Validacao visual
- [ ] Regras de consistencia + banners

6. Acoes de fluxo
- [ ] Salvar, Publicar, Testar (fake)

7. Polimento
- [ ] Estados vazios
- [ ] microinteracoes
- [ ] labels e feedbacks finais

---

## 10. Definicao de pronto (DoD)

A TASKLIST4 sera considerada pronta quando:
- [ ] Tela do Flow Builder estiver acessivel por rota dedicada
- [ ] Usuario conseguir montar fluxo completo no canvas
- [ ] Painel de propriedades funcionar para todos os nodes MVP
- [ ] Validacoes visuais impedirem publicacao invalida
- [ ] Fluxo puder ser salvo/publicado em modo fake
- [ ] UX estiver consistente com o padrao visual do produto

---

## Resumo executivo

Voce vai construir neste ciclo:
- [ ] Canvas estilo React Flow
- [ ] Nodes arrastaveis
- [ ] Conexoes visuais
- [ ] Painel de propriedades dinamico
- [ ] Validacao visual de fluxo
- [ ] UX simples e poderosa
