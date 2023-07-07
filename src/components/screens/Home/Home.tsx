import { Outlet } from 'react-router-dom';

import { Layout } from 'antd';

import { MainMenu, MainMenuCollapseButton } from 'components/screens/MainMenu/MainMenu';

import './Home.scss';

// import { EarLanguageSelector } from '../../common/EarLanguageSelector/EarLanguageSelector';

const { Header, Content } = Layout;

export const Home = () => {
  return (
    <Layout>
      <MainMenu />
      <Layout className="site-layout">
        <header className="header">
          <MainMenuCollapseButton />
          {/* <EarLanguageSelector />
          <UserMenu /> */}
        </header>
        <Content>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};
