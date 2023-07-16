import { Outlet } from 'react-router-dom';

import { usePartialAppContext } from 'core/AppContext';

import { Layout } from 'antd';

import { MainMenu } from 'components/screens/MainMenu/MainMenu';

import './Home.scss';

const { Content } = Layout;

export const Home = () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
