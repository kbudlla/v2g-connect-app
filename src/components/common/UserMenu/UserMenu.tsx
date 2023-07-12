import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { Dropdown, Button } from 'antd';

import './UserMenu.scss';

import { LogoutOutlined, UserOutlined } from '@ant-design/icons';
import { useLogout } from 'hooks/auth/useLogut';

type UserMenuProps = {
  className?: string;
};

export const UserMenu = (props: UserMenuProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation('common');
  const logout = useLogout();

  return (
    <Dropdown
      menu={{
        items: [{ label: t('logout'), key: 'logout', icon: <LogoutOutlined />, className: 'logout' }],
        onClick: (info) => {
          if (info.key === 'logout') logout().then(() => navigate('/auth/login'));
        },
        className: 'user-menu',
      }}
      placement="bottomRight"
      trigger={['click']}
      className={props.className}
    >
      <Button shape="circle">
        <UserOutlined />
      </Button>
    </Dropdown>
  );
};
