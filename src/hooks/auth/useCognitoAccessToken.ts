import { useState, useEffect } from 'react';

import { usePartialAppContext } from 'core/AppContext';

import type { CognitoAccessToken } from 'amazon-cognito-identity-js';
import { Auth } from 'aws-amplify';

export const useCognitoAccessTokenFromAppContext = () => {
  const [accessTokenFromState, setAccessTokenFromState] = usePartialAppContext('accessToken');
  const [state, setState] = useState<{ tokenVerified: boolean; accessToken: CognitoAccessToken | undefined }>({
    tokenVerified: !!accessTokenFromState,
    accessToken: accessTokenFromState,
  });

  useEffect(() => {
    let unmounted = false;

    if (!accessTokenFromState) {
      Auth.currentSession()
        .then((session) => {
          const accessToken = session.getAccessToken();
          // Save the access token in global state for faster refetch
          setAccessTokenFromState(accessToken);
          if (!unmounted) setState({ tokenVerified: true, accessToken });
        })
        .catch(() => {
          if (!unmounted) setState({ tokenVerified: true, accessToken: undefined });
        });
    } else {
      if (!unmounted) setState({ tokenVerified: true, accessToken: accessTokenFromState });
    }

    return () => {
      unmounted = true;
    };
  }, []);

  return state;
};
