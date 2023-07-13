import { PropsWithChildren } from 'react';

import clsx from 'clsx';

type CollapseProps = {
  collapse?: boolean;
  className?: string;
};

function Collapse(props: PropsWithChildren<CollapseProps>): JSX.Element {
  return <div className={clsx('v2g-collapse', props.className, { collapsed: props.collapse })}>{props.children}</div>;
}

export default Collapse;
