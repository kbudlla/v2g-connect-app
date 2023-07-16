import { PropsWithChildren } from 'react';

import clsx from 'clsx';

type CollapseProps = {
  collapse?: boolean;
  className?: string;
  forward?: boolean;
};

function Collapse(props: PropsWithChildren<CollapseProps>): JSX.Element {
  return (
    <div className={clsx('v2g-collapse', props.className, { collapsed: props.collapse, forward: props.forward })}>
      {props.children}
    </div>
  );
}

export default Collapse;
