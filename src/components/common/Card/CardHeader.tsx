import React, { PropsWithChildren } from 'react';

import { Typography } from 'antd';

import RoundedIconContainer from '../RoundedIconContainer/RoundedIconContainer';

type IconComponent = React.FC<React.SVGProps<SVGSVGElement>>;

type CardHeaderProps = {
  title?: string | null;
  icon?: IconComponent;
};

function CardHeader(props: PropsWithChildren<CardHeaderProps>): JSX.Element {
  const { title, icon: Icon, children } = props;
  return (
    <div className="card-header flex flex-row justify-between mb-4 gap-4 flex-wrap">
      <div className="flex flex-row">
        {/* Icon */}
        {Icon && (
          <RoundedIconContainer
            Icon={Icon}
            size={24}
            color="#52c41a"
            backgroundColor="#EDFFEF"
            className="my-auto mr-4"
          />
        )}
        {/* Title */}
        {title && (
          <Typography.Title
            level={2}
            type="success"
            style={{
              margin: 'auto 0 auto 0',
              fontSize: '26px',
              lineHeight: '42px',
              letterSpacing: '-0.2px',
            }}
          >
            {title}
          </Typography.Title>
        )}
      </div>

      {/* Anything else */}
      {children}
    </div>
  );
}

export default React.memo(CardHeader);
