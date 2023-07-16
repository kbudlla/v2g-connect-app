import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { usePartialAppContext } from 'core/AppContext';

import { Typography } from 'antd';

const useTranslatedRandomGreeting = () => {
  const { t } = useTranslation('common');
  const [userFullName] = usePartialAppContext('userFullName');

  const greeting = useMemo(() => {
    if (!userFullName) return 'Loading...';
    const greetings: string[] = t('greetings', { returnObjects: true }); // Get the list of greetings
    const randomIndex = Math.floor(Math.random() * greetings.length);
    return t(`greetings.${randomIndex}`, { user: userFullName });
  }, [userFullName, t]);

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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [userId, setUserId] = useState('very_much_valid_user_id');

  const greeting = useTranslatedRandomGreeting();
  const greetingSubtitle = useTranslatedRandomGreetingSubtitle();

  return (
    // TODO fix this bg-color
    <div className="sticky -top-1 z-20" style={{ backgroundColor: '#f5f5f5' }}>
      <Typography.Title
        level={3}
        className="m-0 font-semibold"
        style={{
          fontFamily: 'Roboto',
          fontSize: 28,
          lineHeight: '38px',
          letterSpacing: '-0.28px',
          color: '#0D1C2E',
        }}
      >
        {greeting}
      </Typography.Title>
      <Typography.Title
        level={5}
        className="m-0 font-normal"
        style={{
          fontFamily: 'Roboto',
          lineHeight: '24px',
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
