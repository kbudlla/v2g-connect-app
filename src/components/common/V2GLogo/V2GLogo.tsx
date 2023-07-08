import { useTranslation } from 'react-i18next';

import { Typography } from 'antd';

import icon from 'assets/icons/v2g-icon.png';

export const V2GLogo: React.FC = () => {
  return (
    <div className="dashboard-logo">
      <img className="icon" src={icon} />
      <Typography.Text className="title">Welcome</Typography.Text>
    </div>
  );
};
