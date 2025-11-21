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

const calcFormatTime = (minutes) => {
  if (!minutes || minutes === 0) return '0 мин';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0 && mins > 0) {
    return `${hours} ч ${mins} мин`;
  }
  if (hours > 0) {
    return `${hours} ч`;
  }
  return `${mins} мин`;
};

const calcRecompute = (root) => {
  if (!root) return;
  const items = Array.from(root.querySelectorAll('.price-item'));
  let total = 0;
  let count = 0;
  let totalTime = 0;

  items.forEach((item) => {
    const checkbox = item.querySelector('.price-item__check');
    if (!checkbox || !checkbox.checked) {
      return;
    }
    const base = Number(checkbox.dataset.price || 0);
    const timeMinutes = Number(checkbox.dataset.time || 0);
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
    totalTime += timeMinutes * qty;
    count += 1;
  });

  const totalNode = root.querySelector('#calc-total');
  const countNode = root.querySelector('#calc-count');
  const timeNode = root.querySelector('#calc-time');
  const currency = totalNode?.dataset.currency || 'RUB';
  if (totalNode) totalNode.textContent = calcFormatCurrency(total, currency);
  if (countNode) countNode.textContent = String(count);
  if (timeNode) timeNode.textContent = calcFormatTime(totalTime);
};

const calcGetSelectedServices = (root) => {
  if (!root) return [];
  const items = Array.from(root.querySelectorAll('.price-item'));
  const services = [];

  items.forEach((item) => {
    const checkbox = item.querySelector('.price-item__check');
    if (!checkbox || !checkbox.checked) {
      return;
    }

    const title = checkbox.dataset.title || '';
    const basePrice = Number(checkbox.dataset.price || 0);
    const timeMinutes = Number(checkbox.dataset.time || 0);
    const qtyInput = item.querySelector('[data-multiplier]');
    const qty = qtyInput ? Math.max(1, Number(qtyInput.value || 1)) : 1;
    let itemTotal = basePrice * qty;
    let details = '';

    // Доплата за масло по бренду
    const oilBrandSelect = item.querySelector('[data-oil-brand]');
    if (oilBrandSelect && oilBrandSelect.tagName === 'SELECT') {
      const selectedOption = /** @type {HTMLSelectElement} */ (oilBrandSelect).selectedOptions?.[0];
      const brandText = selectedOption?.textContent || '';
      const brandName = brandText.split('—')[0]?.trim() || brandText.split('-')[0]?.trim() || '';
      const perLiter = Number(selectedOption?.dataset.price || 0);
      if (!Number.isNaN(perLiter) && perLiter > 0) {
        itemTotal += perLiter * qty;
        details = brandName ? `${brandName} (${qty}л)` : `${qty}л`;
      } else if (qty > 1) {
        details = `${qty} шт`;
      }
    } else if (qty > 1) {
      const unit = item.querySelector('.price-item__unit')?.textContent?.trim() || 'шт';
      details = `${qty} ${unit}`;
    }

    services.push({
      title,
      quantity: qty,
      details,
      price: itemTotal,
      basePrice,
      timeMinutes: timeMinutes * qty,
    });
  });

  return services;
};

const calcBuildWhatsAppMessage = (services, bookingData = {}) => {
  const lines = ['🚗 *Заявка на услуги VL Prime*', ''];
  
  if (services.length > 0) {
    lines.push('*Выбранные услуги:*');
    let total = 0;
    let totalTime = 0;
    services.forEach((service) => {
      const qtyText = service.details ? ` (${service.details})` : service.quantity > 1 ? ` x${service.quantity}` : '';
      const timeText = service.timeMinutes > 0 ? ` — ${calcFormatTime(service.timeMinutes)}` : '';
      lines.push(`• ${service.title}${qtyText}${timeText} — ${calcFormatCurrency(service.price)}`);
      total += service.price;
      totalTime += service.timeMinutes || 0;
    });
    lines.push('');
    lines.push(`*Итого: ${calcFormatCurrency(total)}*`);
    if (totalTime > 0) {
      lines.push(`*Примерное время выполнения: ${calcFormatTime(totalTime)}*`);
    }
    lines.push('');
  }

  const { date, time } = bookingData;
  if (date || time) {
    lines.push('*Запись на обслуживание:*');
    if (date) lines.push(`Дата: ${date}`);
    if (time) lines.push(`Время: ${time}`);
    lines.push('');
  }

  lines.push('Готов записаться на обслуживание!');
  return lines.join('\n');
};

const handleCalcWhatsAppClick = (event) => {
  if (!event) return;

  const form = document.querySelector('#calc-form');
  if (!form) return;

  const services = calcGetSelectedServices(form);
  const notice = document.getElementById('calc-notice');
  
  if (services.length === 0) {
    if (notice) {
      notice.textContent = 'Выберите хотя бы одну услугу';
      notice.style.color = 'rgba(255, 120, 30, 0.9)';
      setTimeout(() => {
        notice.textContent = '';
      }, 3000);
    }
    return;
  }

  // Получаем данные из формы бронирования (дата и время)
  const bookingDate = document.getElementById('booking-date-input')?.value?.trim() || '';
  const bookingTime = document.getElementById('booking-time-input')?.value?.trim() || '';

  const bookingData = {
    date: bookingDate,
    time: bookingTime,
  };

  const message = calcBuildWhatsAppMessage(services, bookingData);
  
  // Получаем номер из tel: ссылки в header или используем дефолтный
  const phoneLink = document.querySelector('.phone-button[href^="tel:"]');
  let phoneNumber = '74951234567';
  if (phoneLink) {
    const telHref = phoneLink.getAttribute('href') || '';
    const match = telHref.match(/tel:\+?(\d+)/);
    if (match && match[1]) {
      phoneNumber = match[1];
    }
  }
  
  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

  window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  
  if (notice) {
    notice.textContent = 'Заявка отправлена в WhatsApp!';
    notice.style.color = 'rgba(138, 255, 138, 0.9)';
    setTimeout(() => {
      notice.textContent = '';
    }, 3000);
  }
};

const initPriceCalculator = () => {
  const form = document.querySelector('#calc-form');
  if (!form) return;

  const onInput = (e) => {
    const target = e.target;
    if (!(target instanceof HTMLElement)) return;
    if (target.matches('.price-item__check') || target.matches('[data-multiplier]') || target.matches('[data-oil-brand]')) {
      calcRecompute(form);
    }
  };

  form.addEventListener('change', onInput);
  form.addEventListener('input', onInput);

  // WhatsApp CTA handler
  const whatsappCta = document.getElementById('calc-whatsapp-cta');
  if (whatsappCta) {
    whatsappCta.addEventListener('click', handleCalcWhatsAppClick);
    whatsappCta.addEventListener('keydown', (e) => {
      if (ACTIVATION_KEYS.includes(e.key)) {
        e.preventDefault();
        handleCalcWhatsAppClick(e);
      }
    });
  }

  // initial compute
  calcRecompute(form);
  
  // Initialize booking calendar within calculator
  initBooking();
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
  if (!monthLabel || !grid || !prev || !next || !slotsRoot || !dateInput || !timeInput) {
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

  renderMonth();
};
