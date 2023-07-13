import React from 'react';

import clsx from 'clsx';

type RoundedIconContainerProps = {
  size: number;
  Icon: React.FC<React.SVGProps<SVGSVGElement>>;

  color: string;
  backgroundColor: string;
  className?: string;
};

function RoundedIconContainer(props: RoundedIconContainerProps): JSX.Element {
  const { size, Icon, color, backgroundColor, className } = props;
  return (
    <div
      className={clsx('rounded-full inline-flex', className)}
      style={{
        width: size + 18,
        height: size + 18,
        backgroundColor,
      }}
    >
      <Icon width={size} height={size} style={{ color, margin: 'auto' }} />
    </div>
  );
}

export default RoundedIconContainer;
