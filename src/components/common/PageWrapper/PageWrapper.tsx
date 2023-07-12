import React, { PropsWithChildren } from 'react';

import { MainMenuCollapseButton } from 'components/screens/MainMenu/MainMenu';

import { clsx } from 'clsx';

import { LanguageSelector } from '../LanguageSelector/LanguageSelector';
import { UserMenu } from '../UserMenu/UserMenu';
import BreadcrumbNavigation from './components/BreadcrumbNavigation/BreadcrumbNavigation';

type PageWrapperProps = {
  showBreadcrumbs?: boolean;
  flexRow?: boolean;
};

function PageWrapper(props: PropsWithChildren<PageWrapperProps>): JSX.Element {
  return (
    <div className="page-wrapper">
      <div className="w-full flex mb-6 mt-4 justify-between">
        <div className="flex">
          <MainMenuCollapseButton className="my-auto w-10 h-10 sm-only mr-4" />
          {props.showBreadcrumbs && <BreadcrumbNavigation />}
        </div>
        <div className="flex gap-4">
          <LanguageSelector className="my-auto" />
          <UserMenu className="my-auto w-10 h-10" />
        </div>
      </div>
      <div className="page-wrapper-content-wrapper">
        <div className={clsx('page-wrapper-content', { flexRow: props.flexRow })}>{props.children}</div>
      </div>
    </div>
  );
}

export default React.memo(PageWrapper);
