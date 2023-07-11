import { Outlet } from 'react-router-dom';

import { usePartialAppContext } from 'core/AppContext';

import { Layout } from 'antd';

import { LanguageSelector } from 'components/common/LanguageSelector/LanguageSelector';
import { UserMenu } from 'components/common/UserMenu/UserMenu';
import { MainMenu, MainMenuCollapseButton } from 'components/screens/MainMenu/MainMenu';

import './Home.scss';

// import { EarLanguageSelector } from '../../common/EarLanguageSelector/EarLanguageSelector';

const { Header, Content } = Layout;

export const Home = () => {
  const [accessToken, setAccessToken] = usePartialAppContext('accessToken');
  console.log(accessToken);
  return (
    <Layout>
      <MainMenu />
      <Layout className="site-layout">
        <header className="header">
          <MainMenuCollapseButton />
          <LanguageSelector />
          <UserMenu />
        </header>
        <Content>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};
