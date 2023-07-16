import { Typography } from 'antd';

import icon from 'assets/icons/v2g-icon.png';

type V2GLogoProps = {
  showTitle?: boolean;
};

function V2GLogo({ showTitle = true }: V2GLogoProps): JSX.Element {
  return (
    <div className="dashboard-logo">
      <img className="icon" src={icon} />
      {showTitle && <Typography.Text className="title">V2GConnect</Typography.Text>}
    </div>
  );
}

export default V2GLogo;
