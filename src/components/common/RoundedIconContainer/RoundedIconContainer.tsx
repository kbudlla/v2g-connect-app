import React from 'react';

type RoundedIconContainerProps = {
  size: number;
  Icon: React.FC<React.SVGProps<SVGSVGElement>>;

  color: string;
  backgroundColor: string;
};

function RoundedIconContainer(props: RoundedIconContainerProps): JSX.Element {
  const { size, Icon, color, backgroundColor } = props;
  return (
    <div
      className="rounded-full inline-flex"
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
