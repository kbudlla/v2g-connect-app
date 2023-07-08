import { useTranslation } from 'react-i18next';

import { Typography } from 'antd';

import icon from 'assets/icons/v2g-icon.png';

export const V2GLogo: React.FC<{ showTitle?: boolean }> = ({ showTitle = true }) => {
  return (
    <div className="dashboard-logo">
      <img className="icon" src={icon} />
      {showTitle && <Typography.Text className="title">V2GConnect</Typography.Text>}
    </div>
  );
};
