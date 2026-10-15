/**
 * Telegram WebApp SDK Integration Wrapper
 */

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        initData: string;
        initDataUnsafe: {
          query_id?: string;
          user?: {
            id: number;
            first_name: string;
            last_name?: string;
            username?: string;
            language_code?: string;
          };
          auth_date?: string;
          hash?: string;
        };
        version: string;
        platform: string;
        colorScheme: 'light' | 'dark';
        themeParams: Record<string, string>;
        isExpanded: boolean;
        viewportHeight: number;
        viewportStableHeight: number;
        headerColor: string;
        backgroundColor: string;
        BackButton: {
          isVisible: boolean;
          show(): void;
          hide(): void;
          onClick(callback: () => void): void;
          offClick(callback: () => void): void;
        };
        MainButton: {
          text: string;
          color: string;
          textColor: string;
          isVisible: boolean;
          isActive: boolean;
          isProgressVisible: boolean;
          setText(text: string): void;
          onClick(callback: () => void): void;
          offClick(callback: () => void): void;
          show(): void;
          hide(): void;
          enable(): void;
          disable(): void;
          showProgress(leaveActive?: boolean): void;
          hideProgress(): void;
        };
        HapticFeedback: {
          impactOccurred(style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft'): void;
          notificationOccurred(type: 'error' | 'success' | 'warning'): void;
          selectionChanged(): void;
        };
        ready(): void;
        expand(): void;
        close(): void;
      };
    };
  }
}

// In-memory or localStorage simulator state for dev/testing in browser
const SIM_KEY = 'tg_sim_init_data';

export const telegram = {
  get isAvailable(): boolean {
    return typeof window !== 'undefined' && Boolean(window.Telegram?.WebApp);
  },

  get isInsideTelegram(): boolean {
    return Boolean(window.Telegram?.WebApp?.initData);
  },

  get webApp() {
    return window.Telegram?.WebApp;
  },

  getInitData(): string {
    if (window.Telegram?.WebApp?.initData) {
      return window.Telegram.WebApp.initData;
    }
    // Check if user set a custom simulated initData in browser sandbox
    const sim = localStorage.getItem(SIM_KEY);
    return sim || '';
  },

  setSimulatedInitData(initData: string) {
    if (initData) {
      localStorage.setItem(SIM_KEY, initData);
    } else {
      localStorage.removeItem(SIM_KEY);
    }
  },

  getUser() {
    if (window.Telegram?.WebApp?.initDataUnsafe?.user) {
      return window.Telegram.WebApp.initDataUnsafe.user;
    }
    return {
      id: 84920481,
      first_name: 'Russell',
      username: 'rcrowee',
    };
  },

  init() {
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
    }
  },

  haptic: {
    impact(style: 'light' | 'medium' | 'heavy' = 'light') {
      try {
        window.Telegram?.WebApp?.HapticFeedback?.impactOccurred(style);
      } catch {
        // ignore in non-tg
      }
    },
    notification(type: 'success' | 'warning' | 'error') {
      try {
        window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred(type);
      } catch {
        // ignore in non-tg
      }
    },
  },
};
