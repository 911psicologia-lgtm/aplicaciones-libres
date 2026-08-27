import { AppConfig, DEFAULT_CONFIG, APP_VERSION } from '../types';

const STORAGE_KEY = 'mpf-config';

function loadStoredConfig(): Partial<AppConfig> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Partial<AppConfig>;
  } catch {
    return {};
  }
}

function storeConfig(config: AppConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch (err) {
    console.error('[config] Failed to save config to localStorage', err);
  }
}

function mergeConfig(base: AppConfig, overrides: Partial<AppConfig>): AppConfig {
  return { ...base, ...overrides };
}

let cachedConfig: AppConfig | null = null;

export function getConfig(): AppConfig {
  if (cachedConfig) return cachedConfig;

  const stored = loadStoredConfig();

  // If stored version differs from current, reset to defaults merged over stored
  if (stored.version !== undefined && stored.version !== APP_VERSION) {
    console.warn(
      `[config] Version mismatch: stored=${stored.version}, current=${APP_VERSION}. Resetting to defaults.`
    );
    const reset = mergeConfig(DEFAULT_CONFIG, stored);
    reset.version = APP_VERSION;
    saveConfig(reset);
    cachedConfig = reset;
    return cachedConfig;
  }

  cachedConfig = mergeConfig(DEFAULT_CONFIG, stored);
  cachedConfig.version = cachedConfig.version ?? APP_VERSION;
  return cachedConfig;
}

export function saveConfig(partial: Partial<AppConfig>): void {
  const current = getConfig();
  const updated = mergeConfig(current, partial);
  cachedConfig = updated;
  storeConfig(updated);
}

export function getThemeMode(): 'light' | 'dark' {
  const config = getConfig();

  if (config.theme === 'system' || config.theme === undefined) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  return config.theme === 'dark' ? 'dark' : 'light';
}

export function isDarkMode(): boolean {
  return getThemeMode() === 'dark';
}
