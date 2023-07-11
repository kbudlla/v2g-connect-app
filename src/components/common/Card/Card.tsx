import React, { PropsWithChildren } from 'react';

import { Card as AntdCard, Spin } from 'antd';

import { clsx } from 'clsx';

type ForwardableCardProps = {
  fullwidth?: boolean;
  fullheight?: boolean;
  loading?: boolean;
  style?: React.CSSProperties;
};

export type ForwardedCardProps<T> = T & ForwardableCardProps;

export type CardProps = {
  header?: JSX.Element;
  fixedheight?: boolean;
} & ForwardableCardProps;

function Card(props: PropsWithChildren<CardProps>): JSX.Element {
  const { fullwidth, fullheight, fixedheight, loading, style } = props;
  return (
    <AntdCard className={clsx('card', { fullwidth, fullheight, fixedheight })} style={style}>
      {props.header && <div className="card-header">{props.header}</div>}
      <div className="card-content">
        {loading && (
          <div className="card-loading-overlay">
            <Spin className="card-spinner" />
          </div>
        )}

        {props.children}
      </div>
    </AntdCard>
  );
}

export default React.memo(Card);
