const ACTIVATION_KEYS = ['Enter', ' ', 'Spacebar'];
const SERVICES_TAB_SELECTOR = '[data-services-tab]';
const SERVICES_TAB_ACTIVE_CLASS = 'services__tab--active';
const SERVICES_TAB_KEYS = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'];

const handleInteractiveEnter = (event) => {
  if (!event) {
    return;
  }

  const { key, currentTarget } = event;

  if (!ACTIVATION_KEYS.includes(key)) {
    return;
  }

  event.preventDefault();

  if (!currentTarget || typeof currentTarget.click !== 'function') {
    return;
  }

  currentTarget.click();
};

window.handleInteractiveEnter = handleInteractiveEnter;

const updateServicesTabSelection = (tabs, selectedTab, shouldFocus = false) => {
  if (!tabs || !tabs.length || !selectedTab) {
    return;
  }

  tabs.forEach((tab) => {
    const isActive = tab === selectedTab;
    tab.classList.toggle(SERVICES_TAB_ACTIVE_CLASS, isActive);
    tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
    tab.setAttribute('tabindex', isActive ? '0' : '-1');

    if (isActive && shouldFocus) {
      tab.focus();
    }
  });
};

const handleServicesTabClick = (event, tabs) => {
  if (!event || !tabs || !tabs.length) {
    return;
  }

  const { currentTarget } = event;

  if (!currentTarget) {
    return;
  }

  updateServicesTabSelection(tabs, currentTarget);
};

const handleServicesTabKeydown = (event, tabs) => {
  if (!event || !tabs || !tabs.length) {
    return;
  }

  const { key, currentTarget } = event;

  if (!SERVICES_TAB_KEYS.includes(key) || !currentTarget) {
    return;
  }

  event.preventDefault();

  const currentIndex = tabs.indexOf(currentTarget);

  if (currentIndex === -1) {
    return;
  }

  if (key === 'Home') {
    updateServicesTabSelection(tabs, tabs[0], true);
    return;
  }

  if (key === 'End') {
    updateServicesTabSelection(tabs, tabs[tabs.length - 1], true);
    return;
  }

  const isNextKey = key === 'ArrowRight' || key === 'ArrowDown';
  const offset = isNextKey ? 1 : -1;
  const nextIndex = (currentIndex + offset + tabs.length) % tabs.length;

  updateServicesTabSelection(tabs, tabs[nextIndex], true);
};

const initServicesTabs = () => {
  const tabs = Array.from(document.querySelectorAll(SERVICES_TAB_SELECTOR));

  if (!tabs.length) {
    return;
  }

  tabs.forEach((tab) => {
    tab.addEventListener('click', (event) => handleServicesTabClick(event, tabs));
    tab.addEventListener('keydown', (event) => handleServicesTabKeydown(event, tabs));
  });
};

document.addEventListener('DOMContentLoaded', initServicesTabs);

// Burger menu
const MENU_OPEN_CLASS = 'menu-open';
const BURGER_SELECTOR = '.burger-button';
const NAV_SELECTOR = '#mobile-nav';

const openMenu = (burger) => {
  document.body.classList.add(MENU_OPEN_CLASS);
  if (burger) {
    burger.setAttribute('aria-expanded', 'true');
    burger.setAttribute('aria-label', 'Закрыть меню');
  }
};

const closeMenu = (burger) => {
  document.body.classList.remove(MENU_OPEN_CLASS);
  if (burger) {
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Открыть меню');
  }
};

const toggleMenu = (burger) => {
  const isOpen = document.body.classList.contains(MENU_OPEN_CLASS);
  if (isOpen) {
    closeMenu(burger);
    return;
  }
  openMenu(burger);
};

const initBurgerMenu = () => {
  const burger = document.querySelector(BURGER_SELECTOR);
  const nav = document.querySelector(NAV_SELECTOR);
  if (!burger || !nav) {
    return;
  }

  burger.addEventListener('click', () => toggleMenu(burger));
  burger.addEventListener('keydown', (e) => {
    if (ACTIVATION_KEYS.includes(e.key)) {
      e.preventDefault();
      toggleMenu(burger);
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeMenu(burger);
    }
  });

  nav.addEventListener('click', (e) => {
    const target = e.target;
    if (!(target instanceof Element)) return;
    if (target.closest('.site-nav__link')) {
      closeMenu(burger);
    }
  });
};

document.addEventListener('DOMContentLoaded', initBurgerMenu);

// Price calculator
const calcFormatCurrency = (value, currency = 'RUB') => {
  try {
    return new Intl.NumberFormat('ru-RU', { style: 'currency', currency, maximumFractionDigits: 0 }).format(value);
  } catch {
    return `${value} ₽`;
  }
};

const calcRecompute = (root) => {
  if (!root) return;
  const items = Array.from(root.querySelectorAll('.price-item'));
  let total = 0;
  let count = 0;

  items.forEach((item) => {
    const checkbox = item.querySelector('.price-item__check');
    if (!checkbox || !checkbox.checked) {
      return;
    }
    const base = Number(checkbox.dataset.price || 0);
    const qtyInput = item.querySelector('[data-multiplier]');
    const qty = qtyInput ? Math.max(1, Number(qtyInput.value || 1)) : 1;
    let itemTotal = base * qty;

    // Доплата за масло по бренду (если есть селектор бренда)
    const oilBrandSelect = item.querySelector('[data-oil-brand]');
    if (oilBrandSelect && oilBrandSelect.tagName === 'SELECT') {
      const selectedOption = /** @type {HTMLSelectElement} */ (oilBrandSelect).selectedOptions?.[0];
      const perLiter = Number(selectedOption?.dataset.price || 0);
      if (!Number.isNaN(perLiter) && perLiter > 0) {
        itemTotal += perLiter * qty;
      }
    }

    total += itemTotal;
    count += 1;
  });

  const totalNode = root.querySelector('#calc-total');
  const countNode = root.querySelector('#calc-count');
  const currency = totalNode?.dataset.currency || 'RUB';
  if (totalNode) totalNode.textContent = calcFormatCurrency(total, currency);
  if (countNode) countNode.textContent = String(count);
};

const initPriceCalculator = () => {
  const form = document.querySelector('#calc-form');
  if (!form) return;

  const onInput = (e) => {
    const target = e.target;
    if (!(target instanceof HTMLElement)) return;
    if (target.matches('.price-item__check') || target.matches('[data-multiplier]')) {
      calcRecompute(form);
    }
  };

  form.addEventListener('change', onInput);
  form.addEventListener('input', onInput);

  // initial compute
  calcRecompute(form);
};

document.addEventListener('DOMContentLoaded', initPriceCalculator);

// Booking calendar and slots
const BOOKING_CONFIG = {
  // Рабочие дни: Пн-Сб. Воскресенье выходной
  workingWeekdays: [1, 2, 3, 4, 5, 6], // 0=Вс ... 6=Сб
  openHour: 9,
  closeHour: 19,
  slotMinutes: 60,
  // Пример занятых слотов (UTC-нейтрально, используем локаль)
  busy: {
    // 'YYYY-MM-DD': ['09:00','13:00', ...]
  },
};

// Пример предзаполненных занятых слотов: сегодня + завтра по паре окон
(() => {
  const toKey = (d) => d.toISOString().slice(0, 10);
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);
  const add = (date, times) => {
    BOOKING_CONFIG.busy[toKey(date)] = times;
  };
  add(today, ['11:00', '15:00']);
  add(tomorrow, ['10:00', '14:00', '17:00']);
})();

const makeDate = (year, monthIndex, day) => new Date(year, monthIndex, day);
const getMonthLabel = (date) =>
  date.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });
const pad2 = (n) => String(n).padStart(2, '0');
const toKey = (date) =>
  `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;

const listSlotsForDate = (date) => {
  const weekday = date.getDay();
  if (!BOOKING_CONFIG.workingWeekdays.includes(weekday)) {
    return { slots: [], closed: true };
  }
  const slots = [];
  const stepMs = BOOKING_CONFIG.slotMinutes * 60 * 1000;
  const dayStart = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    BOOKING_CONFIG.openHour,
    0,
    0,
    0
  );
  const dayEnd = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    BOOKING_CONFIG.closeHour,
    0,
    0,
    0
  );
  for (let t = dayStart; t < dayEnd; t = new Date(t.getTime() + stepMs)) {
    const hh = pad2(t.getHours());
    const mm = pad2(t.getMinutes());
    slots.push(`${hh}:${mm}`);
  }
  return { slots, closed: false };
};

const initBooking = () => {
  const monthLabel = document.getElementById('booking-month-label');
  const grid = document.getElementById('booking-grid');
  const prev = document.querySelector('.booking-calendar__nav--prev');
  const next = document.querySelector('.booking-calendar__nav--next');
  const slotsRoot = document.getElementById('booking-slots');
  const dateInput = document.getElementById('booking-date-input');
  const timeInput = document.getElementById('booking-time-input');
  const form = document.getElementById('booking-form');
  if (!monthLabel || !grid || !prev || !next || !slotsRoot || !dateInput || !timeInput || !form) {
    return;
  }

  let current = new Date();
  current.setDate(1);
  let selectedDate = null;
  let selectedTime = null;

  const renderMonth = () => {
    monthLabel.textContent = getMonthLabel(current);
    grid.innerHTML = '';
    const year = current.getFullYear();
    const month = current.getMonth();
    const firstDay = makeDate(year, month, 1);
    const firstWeekday = (firstDay.getDay() + 6) % 7; // Пн=0 .. Вс=6
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Предыдущие дни (мутные)
    for (let i = 0; i < firstWeekday; i++) {
      const span = document.createElement('span');
      span.className = 'booking-day booking-day--muted';
      span.textContent = ' ';
      grid.appendChild(span);
    }
    // Дни месяца
    for (let day = 1; day <= daysInMonth; day++) {
      const d = makeDate(year, month, day);
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'booking-day';
      btn.textContent = String(day);
      btn.setAttribute('aria-label', d.toLocaleDateString('ru-RU'));

      const weekday = d.getDay();
      // Выходной: Вс
      const isClosed = !BOOKING_CONFIG.workingWeekdays.includes(weekday);
      if (isClosed) {
        btn.classList.add('booking-day--disabled');
      }
      // Прошедшие даты
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const compare = new Date(d);
      compare.setHours(0, 0, 0, 0);
      if (compare < today) {
        btn.classList.add('booking-day--disabled');
      }

      btn.addEventListener('click', () => {
        if (btn.classList.contains('booking-day--disabled')) return;
        grid.querySelectorAll('.booking-day--selected').forEach((n) => n.classList.remove('booking-day--selected'));
        btn.classList.add('booking-day--selected');
        selectedDate = d;
        dateInput.value = d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
        selectedTime = null;
        timeInput.value = '';
        renderSlots();
      });
      grid.appendChild(btn);
    }
  };

  const renderSlots = () => {
    slotsRoot.innerHTML = '';
    if (!selectedDate) {
      slotsRoot.innerHTML = '<span style="opacity:.7">Сначала выберите дату</span>';
      return;
    }
    const key = toKey(selectedDate);
    const { slots, closed } = listSlotsForDate(selectedDate);
    if (closed) {
      slotsRoot.innerHTML = '<span style="opacity:.7">Выходной день</span>';
      return;
    }
    const busySet = new Set(BOOKING_CONFIG.busy[key] || []);
    slots.forEach((time) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'slot';
      btn.textContent = time;
      if (busySet.has(time)) {
        btn.classList.add('slot--busy');
      }
      btn.addEventListener('click', () => {
        if (btn.classList.contains('slot--busy')) return;
        slotsRoot.querySelectorAll('.slot--selected').forEach((n) => n.classList.remove('slot--selected'));
        btn.classList.add('slot--selected');
        selectedTime = time;
        timeInput.value = time;
      });
      slotsRoot.appendChild(btn);
    });
  };

  prev.addEventListener('click', () => {
    current.setMonth(current.getMonth() - 1);
    renderMonth();
  });
  next.addEventListener('click', () => {
    current.setMonth(current.getMonth() + 1);
    renderMonth();
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = /** @type {HTMLInputElement} */ (document.getElementById('booking-name')).value.trim();
    const phone = /** @type {HTMLInputElement} */ (document.getElementById('booking-phone')).value.trim();
    const notice = document.getElementById('booking-notice');
    if (!selectedDate || !selectedTime || !name || !phone) {
      if (notice) notice.textContent = 'Заполните имя, телефон и выберите дату/время.';
      return;
    }
    // Бронируем слот (демо: в памяти)
    const key = toKey(selectedDate);
    BOOKING_CONFIG.busy[key] = [...new Set([...(BOOKING_CONFIG.busy[key] || []), selectedTime])];
    if (notice) {
      const dateStr = selectedDate.toLocaleDateString('ru-RU', { day: '2-digit', month: 'long', year: 'numeric' });
      notice.textContent = `Заявка отправлена: ${dateStr}, ${selectedTime}. Мы скоро свяжемся с вами.`;
    }
    renderSlots();
  });

  renderMonth();
};

document.addEventListener('DOMContentLoaded', initBooking);
