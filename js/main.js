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


