// libs/datepicker-init.js
// Wrapper para fdatepicker (Air Datepicker) com locale pt-BR e integração ao TrainOS

let _dpLoaded = false;
let _dpPromise = null;

/**
 * Carrega o fdatepicker (Air Datepicker) via CDN se ainda não carregado
 */
export function carregarDatepicker() {
  if (_dpLoaded) return Promise.resolve();
  if (_dpPromise) return _dpPromise;

  _dpPromise = new Promise((resolve, reject) => {
    // Carregar CSS
    if (!document.querySelector('link[data-dp-css]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://cdn.jsdelivr.net/npm/air-datepicker@3.5.3/air-datepicker.min.css';
      link.setAttribute('data-dp-css', '1');
      document.head.appendChild(link);
    }

    // Carregar JS
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/air-datepicker@3.5.3/air-datepicker.min.js';
    script.onload = () => { _dpLoaded = true; resolve(); };
    script.onerror = reject;
    document.head.appendChild(script);
  });

  return _dpPromise;
}

// Locale pt-BR para o datepicker
const localePtBR = {
  days: ['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'],
  daysShort: ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'],
  daysMin: ['Do','Se','Te','Qa','Qi','Se','Sá'],
  months: ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'],
  monthsShort: ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'],
  today: 'Hoje',
  clear: 'Limpar',
  dateFormat: 'dd/MM/yyyy',
  timeFormat: 'HH:mm',
  firstDay: 0,
};

/**
 * Inicializa um date picker em um campo de data
 * @param {string|HTMLElement} selector - Seletor CSS ou elemento
 * @param {object} opcoes - Opções adicionais
 * @returns {Promise<AirDatepicker>}
 */
export async function initDatepicker(selector, opcoes = {}) {
  await carregarDatepicker();
  
  const el = typeof selector === 'string' ? document.querySelector(selector) : selector;
  if (!el) return null;

  // Converter valor ISO (YYYY-MM-DD) para Date se existir
  let selectedDates = [];
  if (el.value && el.value.match(/^\d{4}-\d{2}-\d{2}/)) {
    const [y, m, d] = el.value.split('-');
    selectedDates = [new Date(+y, +m - 1, +d)];
  } else if (el.value && el.value.match(/^\d{2}\/\d{2}\/\d{4}/)) {
    const [d, m, y] = el.value.split('/');
    selectedDates = [new Date(+y, +m - 1, +d)];
  }

  // Criar input hidden para armazenar valor ISO
  const hiddenId = el.id + '-iso';
  let hidden = document.getElementById(hiddenId);
  if (!hidden) {
    hidden = document.createElement('input');
    hidden.type = 'hidden';
    hidden.id = hiddenId;
    hidden.name = el.name || el.id;
    el.parentNode.insertBefore(hidden, el.nextSibling);
  }
  if (selectedDates.length) {
    const d = selectedDates[0];
    hidden.value = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  }

  // Ajuste visual do input para o tema dark do TrainOS
  el.style.cursor = 'pointer';
  el.readOnly = true;
  if (selectedDates.length) {
    const d = selectedDates[0];
    el.value = `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
  }

  const dp = new AirDatepicker(el, {
    locale: localePtBR,
    selectedDates,
    dateFormat: 'dd/MM/yyyy',
    autoClose: true,
    isMobile: window.innerWidth < 768,
    moveToOtherMonthsOnSelect: true,
    ...opcoes,
    onSelect({ date, formattedDate }) {
      if (date) {
        const d = Array.isArray(date) ? date[0] : date;
        const iso = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
        hidden.value = iso;
        // Disparar evento de mudança no hidden para compatibilidade
        hidden.dispatchEvent(new Event('change', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
      } else {
        hidden.value = '';
      }
      if (opcoes.onSelect) opcoes.onSelect({ date, formattedDate });
    },
  });

  return dp;
}

/**
 * Lê o valor ISO de um campo que foi transformado em datepicker
 * @param {string} inputId - ID do input original
 * @returns {string} Valor ISO YYYY-MM-DD ou string vazia
 */
export function getDateValue(inputId) {
  const hidden = document.getElementById(inputId + '-iso');
  if (hidden) return hidden.value;
  const el = document.getElementById(inputId);
  return el ? el.value : '';
}

/**
 * Inicializa um timepicker simples usando a biblioteca nativa do navegador
 * com estilo aprimorado (o timepicker-ui precisaria de compilação TypeScript)
 * @param {string|HTMLElement} selector
 */
export function estilizarTimepicker(selector) {
  const el = typeof selector === 'string' ? document.querySelector(selector) : selector;
  if (!el || el.type !== 'time') return;
  
  // Adicionar classe de estilo aprimorado
  el.classList.add('timepicker-enhanced');
}
