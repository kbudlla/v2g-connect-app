import React, { PropsWithChildren } from 'react';

import { Card as AntdCard, Spin } from 'antd';

import { clsx } from 'clsx';

type ForwardableCardProps = {
  fullwidth?: boolean;
  fullheight?: boolean;
  disablePadding?: boolean;
  loading?: boolean;
  style?: React.CSSProperties;
  className?: string;
};

export type ForwardedCardProps<T> = T & ForwardableCardProps;

export type CardProps = {
  header?: JSX.Element;
  fixedheight?: boolean;
} & ForwardableCardProps;

function Card(props: PropsWithChildren<CardProps>): JSX.Element {
  const { fullwidth, fullheight, fixedheight, disablePadding, loading, style } = props;
  return (
    <AntdCard
      className={clsx('card', props.className, { fullwidth, fullheight, fixedheight, disablePadding })}
      style={style}
    >
      {props.header && props.header}
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
