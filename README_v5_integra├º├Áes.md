# TrainOS v5 — Integração de Bibliotecas (Script.7z)

## Bibliotecas do Script.7z aplicadas

O arquivo `Script.7z` continha 4 bibliotecas de componentes UI:

| Biblioteca | Versão | Aplicação no TrainOS |
|---|---|---|
| **fdatepicker** (Air Datepicker) | 3.5.x | Date pickers nos modais de Turmas e Financeiro |
| **timepicker-ui** | 2.x | Estilização dos campos `<input type="time">` nas Turmas |
| **monochrome-ui** | main | Tabs acessíveis (WAI-ARIA) na Ficha do Aluno |
| **rt-accordion** | main | Base para o componente Accordion nos Relatórios |
| **webtui** | master | Referência de estilos — integrado ao design system do TrainOS |

> **Nota técnica:** As bibliotecas no arquivo 7z estavam em formato TypeScript fonte (não compilado). Por isso foram criados wrappers próprios em `libs/` que implementam as mesmas funcionalidades, com o Air Datepicker carregado via CDN (disponível em npm/jsdelivr).

---

## Arquivos criados/modificados

### Novos arquivos

#### `libs/datepicker-init.js`
Wrapper para o **Air Datepicker** (implementação de referência do fdatepicker):
- Carregamento lazy via CDN no primeiro uso
- Locale `pt-BR` nativo (meses, dias, labels em português)
- Converte automaticamente entre formato visual (DD/MM/AAAA) e ISO (YYYY-MM-DD) para o Supabase
- Funções exportadas: `initDatepicker(el)`, `getDateValue(id)`, `estilizarTimepicker(el)`

#### `libs/accordion-tabs.js`
Componentes de **Tabs** e **Accordion** com acessibilidade completa (padrão monochrome-ui):
- WAI-ARIA: `role="tablist"`, `role="tab"`, `role="tabpanel"`, `aria-selected`, `aria-controls`
- Navegação por teclado: setas ←→, Home, End
- Animação suave nos accordions com `max-height` transition
- Funções exportadas: `renderTabs(id, abas)`, `initTabs(id)`, `renderAccordion(id, items)`, `initAccordion(id, opts)`

### Arquivos modificados

#### `modules/turmas.js`
- Campos "Data Início" e "Data Fim" → Air Datepicker com seletor visual calendário
- Campos "Horário Início" e "Horário Fim" → estilo aprimorado com ícone de relógio
- Valores ISO lidos via `getDateValue()` para salvar no Supabase

#### `modules/financeiro.js`
- Campos "Vencimento" e "Data Recebimento" → Air Datepicker
- Fallback automático para valor string caso datepicker não inicialize

#### `modules/alunos.js`
- **Ficha do Aluno**: Tabs simples (`div` + `display:none`) → Tabs acessíveis WAI-ARIA
- Badges com contagem em cada aba (Histórico, Financeiro, Certificados)
- Ícones Material Symbols em cada tab
- Animação `fadeIn` ao trocar de aba

#### `modules/relatorios.js`
- Import de `renderAccordion` e `initAccordion` (pronto para uso nos relatórios expandíveis)

#### `css/style.css`
Estilos adicionados:
- Tema dark do Air Datepicker usando variáveis CSS do TrainOS
- `.input-date-wrap` — input com ícone de calendário inline
- `.tabs-container`, `.tabs-list`, `.tab-btn` — tabs aprimoradas
- `.badge-count` — badges de contagem nas tabs
- `.accordion`, `.accordion-item`, `.accordion-trigger`, `.accordion-panel` — componente accordion
- `.timepicker-enhanced` — input time com ícone de relógio
- `.kanban-card.dragging`, `.kanban-col.drag-over` — feedback visual no drag-and-drop

#### `index.html`
- Adicionado CSS do Air Datepicker via CDN jsdelivr

---

## Como usar os componentes

### Date Picker numa nova tela

```js
import { initDatepicker, getDateValue } from '../libs/datepicker-init.js';

// No HTML do modal:
// <div class="input-date-wrap"><input type="text" id="minha-data" placeholder="DD/MM/AAAA"/></div>

// Após appendChild do modal:
initDatepicker(document.getElementById('minha-data'));

// Ao salvar:
const data = getDateValue('minha-data'); // retorna "2025-03-15" (ISO)
```

### Tabs numa nova tela

```js
import { renderTabs, initTabs } from '../libs/accordion-tabs.js';

const html = renderTabs('meu-tabs', [
  { id: 'aba1', label: 'Aba 1', icon: 'settings', content: '<p>Conteúdo 1</p>' },
  { id: 'aba2', label: 'Aba 2', icon: 'info',     content: '<p>Conteúdo 2</p>', badge: 5 },
]);

document.getElementById('container').innerHTML = html;
initTabs('meu-tabs');
```

### Accordion

```js
import { renderAccordion, initAccordion } from '../libs/accordion-tabs.js';

const html = renderAccordion('meu-accordion', [
  { label: 'Seção 1', icon: 'settings', content: '<p>...</p>', open: true },
  { label: 'Seção 2', icon: 'info',     content: '<p>...</p>' },
]);

document.getElementById('container').innerHTML = html;
initAccordion('meu-accordion', { multiple: false });
```

---

## Próximos passos sugeridos

1. **Filtros de data no Financeiro** — Adicionar date range picker para filtrar por período
2. **Agenda de Turmas** — Usar Air Datepicker em modo inline como mini-calendário de turmas
3. **Accordion em Configurações** — Agrupar seções com accordion (Escola, Certificado, Tema, Usuários)
4. **Drag and Drop no Pipeline** — Os estilos `.dragging`/`.drag-over` estão prontos; integrar SortableJS
5. **Timepicker nativo aprimorado** — Explorar timepicker-ui via CDN quando disponível em versão compilada
