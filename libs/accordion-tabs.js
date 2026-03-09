// libs/accordion-tabs.js
// Implementação própria de Accordion e Tabs para o TrainOS
// Baseado nos padrões da monochrome-ui (acessibilidade WAI-ARIA completa)

/**
 * Inicializa um conjunto de tabs
 * @param {string} containerId - ID do container
 */
export function initTabs(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const tabList = container.querySelector('[role="tablist"]');
  const tabs = Array.from(container.querySelectorAll('[role="tab"]'));
  const panels = Array.from(container.querySelectorAll('[role="tabpanel"]'));

  function selectTab(tab) {
    tabs.forEach(t => {
      t.setAttribute('aria-selected', 'false');
      t.setAttribute('tabindex', '-1');
      t.classList.remove('active');
    });
    panels.forEach(p => {
      p.hidden = true;
      p.classList.remove('active');
    });

    tab.setAttribute('aria-selected', 'true');
    tab.setAttribute('tabindex', '0');
    tab.classList.add('active');

    const panelId = tab.getAttribute('aria-controls');
    const panel = document.getElementById(panelId);
    if (panel) {
      panel.hidden = false;
      panel.classList.add('active');
    }

    // Trigger custom event
    container.dispatchEvent(new CustomEvent('tab:change', { detail: { tab, panelId }, bubbles: true }));
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => selectTab(tab));
    tab.addEventListener('keydown', e => {
      const idx = tabs.indexOf(e.target);
      if (e.key === 'ArrowRight') { e.preventDefault(); selectTab(tabs[(idx + 1) % tabs.length]); tabs[(idx + 1) % tabs.length].focus(); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); selectTab(tabs[(idx - 1 + tabs.length) % tabs.length]); tabs[(idx - 1 + tabs.length) % tabs.length].focus(); }
      if (e.key === 'Home') { e.preventDefault(); selectTab(tabs[0]); tabs[0].focus(); }
      if (e.key === 'End') { e.preventDefault(); selectTab(tabs[tabs.length - 1]); tabs[tabs.length - 1].focus(); }
    });
  });

  // Activate first tab by default
  const activeTab = tabs.find(t => t.getAttribute('aria-selected') === 'true') || tabs[0];
  if (activeTab) selectTab(activeTab);
}

/**
 * Inicializa um accordion
 * @param {string} containerId
 * @param {object} opts - { multiple: bool, animate: bool }
 */
export function initAccordion(containerId, opts = {}) {
  const { multiple = false, animate = true } = opts;
  const container = document.getElementById(containerId);
  if (!container) return;

  const items = Array.from(container.querySelectorAll('.accordion-item'));

  items.forEach(item => {
    const button = item.querySelector('.accordion-trigger');
    const panel = item.querySelector('.accordion-panel');
    if (!button || !panel) return;

    button.setAttribute('aria-expanded', item.classList.contains('open') ? 'true' : 'false');
    if (!item.classList.contains('open')) panel.style.maxHeight = '0';

    button.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');

      if (!multiple) {
        items.forEach(other => {
          if (other !== item && other.classList.contains('open')) {
            closeItem(other);
          }
        });
      }

      if (isOpen) closeItem(item);
      else openItem(item);
    });

    button.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); button.click(); }
    });
  });

  function openItem(item) {
    const button = item.querySelector('.accordion-trigger');
    const panel = item.querySelector('.accordion-panel');
    item.classList.add('open');
    button.setAttribute('aria-expanded', 'true');
    if (animate) {
      panel.style.maxHeight = panel.scrollHeight + 'px';
      panel.addEventListener('transitionend', () => {
        if (item.classList.contains('open')) panel.style.maxHeight = 'none';
      }, { once: true });
    } else {
      panel.style.maxHeight = 'none';
    }
  }

  function closeItem(item) {
    const button = item.querySelector('.accordion-trigger');
    const panel = item.querySelector('.accordion-panel');
    if (animate && panel.style.maxHeight === 'none') {
      panel.style.maxHeight = panel.scrollHeight + 'px';
      requestAnimationFrame(() => {
        panel.style.maxHeight = '0';
      });
    } else {
      panel.style.maxHeight = '0';
    }
    item.classList.remove('open');
    button.setAttribute('aria-expanded', 'false');
  }
}

/**
 * Gera o HTML para um componente de tabs
 * @param {Array<{id: string, label: string, icon?: string, content: string}>} abas
 * @param {string} containerId
 * @returns {string} HTML
 */
export function renderTabs(containerId, abas) {
  const tabList = abas.map((aba, i) => `
    <button role="tab" 
            id="tab-${containerId}-${aba.id}" 
            aria-controls="panel-${containerId}-${aba.id}"
            aria-selected="${i === 0 ? 'true' : 'false'}"
            tabindex="${i === 0 ? '0' : '-1'}"
            class="tab-btn${i === 0 ? ' active' : ''}">
      ${aba.icon ? `<span class="material-symbols-rounded">${aba.icon}</span>` : ''}
      ${aba.label}
      ${aba.badge ? `<span class="badge-count">${aba.badge}</span>` : ''}
    </button>
  `).join('');

  const panels = abas.map((aba, i) => `
    <div role="tabpanel"
         id="panel-${containerId}-${aba.id}"
         aria-labelledby="tab-${containerId}-${aba.id}"
         ${i !== 0 ? 'hidden' : ''}
         class="tab-panel${i === 0 ? ' active' : ''}">
      ${aba.content}
    </div>
  `).join('');

  return `
    <div class="tabs-container" id="${containerId}">
      <div class="tabs-list" role="tablist" aria-label="Navegação">
        ${tabList}
      </div>
      <div class="tabs-panels">
        ${panels}
      </div>
    </div>
  `;
}

/**
 * Gera o HTML para um accordion
 */
export function renderAccordion(containerId, items) {
  const html = items.map((item, i) => `
    <div class="accordion-item${item.open ? ' open' : ''}">
      <button class="accordion-trigger" 
              aria-expanded="${item.open ? 'true' : 'false'}"
              aria-controls="acc-panel-${containerId}-${i}">
        <div class="accordion-trigger-content">
          ${item.icon ? `<span class="material-symbols-rounded">${item.icon}</span>` : ''}
          <span>${item.label}</span>
          ${item.badge ? `<span class="badge badge-info text-xs">${item.badge}</span>` : ''}
        </div>
        <span class="material-symbols-rounded accordion-chevron">expand_more</span>
      </button>
      <div class="accordion-panel" 
           id="acc-panel-${containerId}-${i}"
           role="region">
        <div class="accordion-panel-inner">
          ${item.content}
        </div>
      </div>
    </div>
  `).join('');

  return `<div class="accordion" id="${containerId}">${html}</div>`;
}
