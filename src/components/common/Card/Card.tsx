import React, { PropsWithChildren } from 'react';

import { Card as AntdCard } from 'antd';

import { clsx } from 'clsx';

type CardProps = {
  header?: JSX.Element;
  fullwidth?: boolean;
  style?: React.CSSProperties;
};

function Card(props: PropsWithChildren<CardProps>): JSX.Element {
  return (
    <AntdCard className={clsx('card', { fullwidth: props.fullwidth })} style={props.style}>
      {props.header && <div className="card-header">{props.header}</div>}
      {props.children}
    </AntdCard>
  );
}

export default React.memo(Card);
