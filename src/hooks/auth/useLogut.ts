import { useCallback } from 'react';

import { usePartialAppContext } from 'core/AppContext';

import { Auth } from 'aws-amplify';

export const useLogout = () => {
  const [accessTokenFromState, setAccessTokenFromState] = usePartialAppContext('accessToken');

  return useCallback(async () => {
    if (!accessTokenFromState) return;

    try {
      await Auth.signOut();
    } catch {
      // Void signOut error this means our cached token was bad
    } finally {
      setAccessTokenFromState(undefined);
    }
  }, [accessTokenFromState]);
};
