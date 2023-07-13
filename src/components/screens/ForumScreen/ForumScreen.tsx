import { Outlet } from 'react-router';

import PageWrapper from 'components/common/PageWrapper/PageWrapper';

function ForumScreen(): JSX.Element {
  return (
    <PageWrapper showBreadcrumbs>
      <Outlet />
    </PageWrapper>
  );
}

export default ForumScreen;
