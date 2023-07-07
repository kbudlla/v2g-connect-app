import { useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NavigateFunction, useLocation, useMatch, useMatches, useNavigate, useNavigation } from 'react-router-dom';

import { usePartialAppContext } from 'core/AppContext';

import { MenuProps, Layout, Menu, Button } from 'antd';

import './MainMenu.scss';

import i18next, { TFunction } from 'i18next';

// import { usePartialAppContext } from '../AppContext/AppContext';
// import { EarnestDashboardLogo } from '../EarnestDashboardLogo/EarnestDashboardLogo';
import {
  LineChartOutlined,
  MobileOutlined,
  FileDoneOutlined,
  PieChartOutlined,
  TeamOutlined,
  MenuOutlined,
  CloseOutlined,
  MessageOutlined,
  SafetyOutlined,
  AuditOutlined,
} from '@ant-design/icons';

type MenuItem = Required<MenuProps>['items'][number];
const makeMenuItems = (t: TFunction<'general'>, navigate: NavigateFunction): MenuItem[] => [
  {
    key: 'dashboard',
    label: 'Dashboard',
    title: '',
    icon: <PieChartOutlined />,
    disabled: true,
  },
];

export const MainMenuCollapseButton = () => {
  const [, setIsMainMenuCollapsed] = usePartialAppContext('isMainMenuCollapsed');

  const onUncollapseClick = () => {
    setIsMainMenuCollapsed(false);
    window.scrollTo({ top: 0, left: 0 });
  };

  return (
    <Button shape="round" onClick={onUncollapseClick} className="round-btn menu-btn">
      <MenuOutlined width={20} height={20} />
    </Button>
  );
};

export const MainMenu = () => {
  const [isMainMenuCollapsed, setIsMainMenuCollapsed] = usePartialAppContext('isMainMenuCollapsed');
  const [collapsible, setCollapsible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation('general');
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const items = useMemo(() => makeMenuItems(t, navigate), [i18next.language]);
  return (
    <div
      className="sider-container"
      ref={containerRef}
      onClick={(event) => event.target === containerRef.current && setIsMainMenuCollapsed(true)}
    >
      <Layout.Sider
        breakpoint="lg"
        collapsedWidth="0"
        width={collapsible ? 280 : 240}
        theme="light"
        collapsed={isMainMenuCollapsed && window.innerWidth <= 768}
        onBreakpoint={(broken) => setCollapsible(broken)}
        className="menu-container"
        trigger={null}
      >
        {/* <div className="logo-container">
          <EarnestDashboardLogo />
        </div> */}
        <Menu
          data-testid="left-menu"
          selectedKeys={[pathname]}
          onClick={(info) => {
            navigate(info.key);
            setIsMainMenuCollapsed(true);
          }}
          className="dashboard-menu"
          theme="light"
          mode="inline"
          items={items}
          inlineIndent={32}
        />
      </Layout.Sider>
    </div>
  );
};
