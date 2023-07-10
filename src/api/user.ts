import { useCallback, useEffect, useRef, useState } from 'react';

import { APIHookError, APIResponse } from './types';

import { resolveWithTimeout } from 'utils/mock';

import { faker } from '@faker-js/faker';

/* Typing */

export type UserInfo = {
  id: string;
  name: {
    first: string;
    last: string;
  };
  email: string;
  phone: string;
  location: string;
};

/* Helper functions */

const createFakeUser = (): UserInfo => {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  const email = faker.internet.email({ firstName, lastName });

  return {
    id: faker.string.uuid(),
    name: {
      first: firstName,
      last: lastName,
    },
    email,
    location: faker.location.city(),
    phone: faker.phone.number(),
  };
};

/* API abstraction */

export const getUserInfo = async (id: UserInfo['id']): Promise<APIResponse<UserInfo>> => {
  const user = createFakeUser();

  const data: UserInfo = {
    ...user,
    id,
  };

  return resolveWithTimeout({ status: 200, data });
};

/* Hooks */

export const useUserInfo = (id: UserInfo['id']) => {
  const [loading, setLoading] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [error, setError] = useState<APIHookError | null>(null);
  const isMountedRef = useRef(false);

  const update = useCallback(() => {
    // TODO this is very generic, so we could make this a wrapper thingie
    setLoading(true);
    getUserInfo(id).then((val) => {
      if (!isMountedRef.current) return;
      setLoading(false);
      if (val.status !== 200) {
        setError(APIHookError.InvalidRequestError);
        setUserInfo(null);
        return;
      }
      if (val.data == null) {
        setError(APIHookError.ServerSideError);
        setUserInfo(null);
        return;
      }
      setError(null);
      setUserInfo(val.data);
    });
  }, [id]);

  useEffect(() => {
    isMountedRef.current = true;

    // Update on mount
    update();

    return () => {
      isMountedRef.current = false;
    };
  }, [update]);

  return {
    loading,
    error,
    userInfo,
    update,
  };
};
