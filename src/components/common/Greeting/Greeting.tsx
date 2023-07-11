import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { UserInfo, useUserInfo } from 'api/user';

import { Typography } from 'antd';

const useTranslatedRandomGreeting = (userInfo: UserInfo | null) => {
  const { t } = useTranslation('common');

  const greeting = useMemo(() => {
    if (!userInfo) return 'Loading...';
    const greetings: string[] = t('greetings', { returnObjects: true }); // Get the list of greetings
    const randomIndex = Math.floor(Math.random() * greetings.length);
    return t(`greetings.${randomIndex}`, { user: `${userInfo.name.first} ${userInfo.name.last}` });
  }, [userInfo, t]);

  return greeting;
};

function useTranslatedRandomGreetingSubtitle() {
  const { t } = useTranslation('common');

  const greetingSubtitle = useMemo(() => {
    const subtitles: string[] = t('greetingSubtitles', { returnObjects: true });
    const randomIndex = Math.floor(Math.random() * subtitles.length);
    return subtitles[randomIndex];
  }, [t]);

  return greetingSubtitle;
}

function Greeting(): JSX.Element {
  const [userId] = useState('very_much_valid_user_id');
  const { userInfo } = useUserInfo(userId);

  const greeting = useTranslatedRandomGreeting(userInfo);
  const greetingSubtitle = useTranslatedRandomGreetingSubtitle();

  return (
    <div>
      <Typography.Title
        level={3}
        style={{
          fontFamily: 'Roboto',
          margin: 0,
          fontSize: 28,
          fontWeight: 600,
          lineHeight: '38px',
          letterSpacing: '-0.28px',
          color: '#0D1C2E',
        }}
      >
        {greeting}
      </Typography.Title>
      <Typography.Title
        level={5}
        style={{
          fontFamily: 'Roboto',
          margin: 0,
          lineHeight: '24px',
          fontWeight: 400,
          letterSpacing: '-0.016px',
          color: '#868D97',
        }}
      >
        {greetingSubtitle}
      </Typography.Title>
    </div>
  );
}

export default Greeting;
