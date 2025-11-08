import { persist, PersistStorage, StorageValue } from "zustand/middleware";
import { create } from "zustand";

export interface AppStoreState {
  isAuthenticated: boolean;
  setIsAuthenticated: (authStatus: boolean) => void;
}

export const useAppStore = create<AppStoreState>(set => ({
  isAuthenticated: cookieStorage.getItem("token") !== null,
  setIsAuthenticated: (isAuthenticated: boolean) => set({isAuthenticated}),
}));

export interface TokenStoreState {
  token: string | null;
  setToken: (token: string) => void;
}

const cookieStorage: PersistStorage<TokenStoreState> = {
  getItem: (name: string) => {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    if (match) {
      const cookieValue = decodeURIComponent(match[2]);
      const parsedCookie = JSON.parse(cookieValue);
      return parsedCookie.state.token;
    }
    return null;
  },
  setItem: (name: string, value: StorageValue<TokenStoreState>) => {
    document.cookie = `${name}=${encodeURIComponent(JSON.stringify(value))}; SameSite=Strict; path=/`; // Encode and stringify value before setting cookie
  },
  removeItem: (name: string) => {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict; path=/`;
  },
};

export const useTokenStore = create(
  persist<TokenStoreState>(
    (set) => ({
      token: cookieStorage.getItem('token') as unknown as string || null,
      setToken: (token: string) => set({ token }),
    }),
    {
      name: 'token',
      storage: cookieStorage,
    }
  )
);
