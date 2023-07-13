import { Outlet } from 'react-router-dom';

import { usePartialAppContext } from 'core/AppContext';

import { Layout } from 'antd';

import { MainMenu } from 'components/screens/MainMenu/MainMenu';

import './Home.scss';

const { Content } = Layout;

export const Home = () => {
  const [accessToken, setAccessToken] = usePartialAppContext('accessToken');
  return (
    <Layout>
      <MainMenu />
      <Layout className="site-layout">
        <Content>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};
