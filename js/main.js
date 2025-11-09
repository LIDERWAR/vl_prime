const ACTIVATION_KEYS = ['Enter', ' ', 'Spacebar'];

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


