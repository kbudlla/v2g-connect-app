import { useTranslation } from 'react-i18next';
import { Outlet, useLocation } from 'react-router-dom';

import { Divider, Image, Layout, Space, Typography } from 'antd';

import { LanguageSelector } from 'components/common/LanguageSelector/LanguageSelector';
import { V2GLogo } from 'components/common/V2GLogo/V2GLogo';

import './Access.scss';

import forgotPasswordImage from 'assets/images/forgot-password.jpg';
import loginImage from 'assets/images/login-image.jpg';
import resetPasswordImage from 'assets/images/reset-password.jpg';

export const AccessScreen = () => {
  const location = useLocation();
  let image = loginImage;
  switch (true) {
    case location.pathname.includes('/auth/forgot-password'):
      image = forgotPasswordImage;
      break;
    case location.pathname.includes('/auth/reset-password'):
      image = resetPasswordImage;
      break;
    default:
      break;
  }
  return (
    <Layout className="access-screen">
      <header className="header">
        <V2GLogo />
        <LanguageSelector />
      </header>
      <main>
        <Outlet />
        <div className="picture">
          <Image width={'100%'} preview={false} src={image} />
        </div>
      </main>
    </Layout>
  );
};
