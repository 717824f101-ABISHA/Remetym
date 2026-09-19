/**
 * RemeTym Storage Utilities
 * Manages LocalStorage initializations and CRUD operations cleanly.
 */

export const KEYS = {
  AUTH_USER: 'remetym_auth_user',
  AUTH_TOKEN: 'remetym_auth_token',
  USERS: 'med_sys_users',
  REGISTRATION_REQUESTS: 'med_sys_registration_requests',
  SENT_EMAILS: 'med_sys_sent_emails',
  PASSWORD_RESET: 'remetym_password_reset',
  MEDICINES: 'med_sys_medicines',
  BATCHES: 'med_sys_batches',
  INVENTORY: 'med_sys_inventory',
  REQUESTS: 'med_sys_requests',
  TRANSFER_HISTORY: 'med_sys_transfer_history',
  NOTIFICATIONS: 'med_sys_notifications',
  DISTRICTS: 'med_sys_districts',
  PHCS: 'med_sys_phcs',
  SETTINGS_ADMIN: 'remetym_admin_settings',
  SETTINGS_PHC: 'remetym_phc_settings',
  SETTINGS_DHO: 'remetym_dho_settings'
};

export const initializeStorage = () => {
  if (typeof window === 'undefined') return;

  // Clear legacy mock/dummy storage keys so only real microservice API data is used
  const legacyDummyKeys = [
    KEYS.USERS,
    KEYS.MEDICINES,
    KEYS.BATCHES,
    KEYS.INVENTORY,
    KEYS.REQUESTS,
    KEYS.TRANSFER_HISTORY,
    KEYS.NOTIFICATIONS,
    KEYS.DISTRICTS,
    KEYS.PHCS
  ];

  legacyDummyKeys.forEach((key) => {
    localStorage.removeItem(key);
  });

  if (!localStorage.getItem(KEYS.REGISTRATION_REQUESTS)) {
    localStorage.setItem(KEYS.REGISTRATION_REQUESTS, JSON.stringify([]));
  }
  if (!localStorage.getItem(KEYS.SENT_EMAILS)) {
    localStorage.setItem(KEYS.SENT_EMAILS, JSON.stringify([]));
  }
};

export const getItem = (key, fallback = []) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (err) {
    console.error(`Error reading ${key} from localStorage`, err);
    return fallback;
  }
};

export const setItem = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Error writing ${key} to localStorage`, err);
  }
};

export const removeItem = (key) => {
  try {
    localStorage.removeItem(key);
  } catch (err) {
    console.error(`Error removing ${key} from localStorage`, err);
  }
};
