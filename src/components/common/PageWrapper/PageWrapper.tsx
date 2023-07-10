import React, { PropsWithChildren } from 'react';

import { clsx } from 'clsx';

import BreadcrumbNavigation from './components/BreadcrumbNavigation/BreadcrumbNavigation';

type PageWrapperProps = {
  showBreadcrumbs?: boolean;
  flexRow?: boolean;
};

function PageWrapper(props: PropsWithChildren<PageWrapperProps>): JSX.Element {
  return (
    <div className="page-wrapper">
      <div className="page-wrapper-header">{props.showBreadcrumbs && <BreadcrumbNavigation />}</div>
      <div className={clsx('page-wrapper-content', { flexRow: props.flexRow })}>{props.children}</div>
    </div>
  );
}

export default React.memo(PageWrapper);
