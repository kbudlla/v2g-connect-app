import { createContext, useCallback, useContext, useRef, useSyncExternalStore } from 'react';

import type { CognitoAccessToken } from 'amazon-cognito-identity-js';

// This context file is mainly inspired by https://www.youtube.com/watch?v=ZKlXqrcBx88 (Making React Context FAST!)
// This uses latest react hook `useSyncExternalStore` which provide a good data handling in React 18

type AppContextStore = {
  isMainMenuCollapsed: boolean;
  accessToken?: CognitoAccessToken;
};

const InitialAppContextValues: AppContextStore = {
  isMainMenuCollapsed: true,
};

/**
 * Function that generate the pub sub pattern for `useSyncExternalStore`
 */
const getAppContextPubSub = (initialValues: AppContextStore) => {
  // Use a ref for the store
  const store = useRef(initialValues);
  const subscribers = useRef(new Set<() => void>());

  // Note: All input of `useSyncExternalStore` requires to be memoised so it doesn't go wild and cause unwanted re-render.
  const get = useCallback(() => store.current, []);

  const set = useCallback((value: Partial<AppContextStore>) => {
    store.current = { ...store.current, ...value };
    subscribers.current.forEach((callback) => callback());
  }, []);

  const subscribe = useCallback((callback: () => void) => {
    subscribers.current.add(callback);
    return () => subscribers.current.delete(callback);
  }, []);

  return {
    get,
    set,
    subscribe,
  };
};

const AppContext = createContext<ReturnType<typeof getAppContextPubSub> | null>(null);

export const AppContextProvider = ({ children }: { children: React.ReactNode }) => (
  <AppContext.Provider value={getAppContextPubSub(InitialAppContextValues)}>{children}</AppContext.Provider>
);

export const usePartialAppContext = <Selector extends keyof AppContextStore>(selector: Selector) => {
  const store = useContext(AppContext);
  if (!store) throw new Error('<AppContextProvider> is not used as any parent of the component using that function');

  const state = useSyncExternalStore(store.subscribe, () => store.get()[selector]);
  const setState = useCallback((value: typeof state) => store.set({ [selector]: value }), []);

  return [state, setState] as const;
};
