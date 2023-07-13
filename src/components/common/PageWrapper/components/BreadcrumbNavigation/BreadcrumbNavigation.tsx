import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router';

import { Typography } from 'antd';

import { clsx } from 'clsx';

const useBreadcrumbPath = () => {
  const { pathname } = useLocation();
  const { t } = useTranslation('common');

  const translatedPathNameMap: Record<string, string> = useMemo(
    () => ({
      dashboard: t('routeNameDashboard'),
      sustainability: t('routeNameSustainability'),
      'charger-map': t('routeNameChargerMap'),
      rewards: t('routeNameRewards'),
      community: t('routeNameForum'),
    }),
    [t],
  );
  const pathElements = useMemo(() => {
    const parts = pathname.split('/').filter((e) => e);
    const basePathName = pathname.replace(/^(\/[^/]+)(\/.+)$/, '$1');
    const isForum = basePathName === '/community';

    // For each of the parts, we can get both the human-readable title
    // and the corresponding URL
    return [
      ...parts.slice(0, isForum ? 1 : 2).map((part, index, parts) => {
        const path = parts.filter((_, ii) => ii < index).join('/');
        return {
          title: translatedPathNameMap[part] ?? part,
          url: path ? `/${path}/${part}` : `/${part}`,
        };
      }),
      // Extra Path element for Forum
      ...(isForum && parts.length === 2
        ? [
            {
              title: atob(parts[parts.length - 1]).split('|')[0],
              url: pathname,
            },
          ]
        : []),
    ];
  }, [pathname, translatedPathNameMap]);

  return pathElements;
};

type BreadcrumbPathElementProps = {
  title: string;
  url: string;
};

function BreadcrumbPathElement(props: BreadcrumbPathElementProps): JSX.Element {
  const { title, url } = props;
  const navigate = useNavigate();
  const location = useLocation();

  const handleClick = useCallback(() => {
    // Noop if we're already on the correct page
    if (location.pathname === url) return;
    navigate(url);
  }, [navigate, location, url]);

  const { selected } = useMemo(
    () => ({
      selected: location.pathname === url,
    }),
    [location],
  );

  return (
    <Typography className={clsx('breadcrumb-navigation-text', { selected: selected })} onClick={handleClick}>
      {title}
    </Typography>
  );
}

function BreadcrumbNavigation(): JSX.Element {
  const pathElements = useBreadcrumbPath();
  return (
    <div className="breadcrumb-wrapper my-auto flex gap-2">
      {pathElements.map((part, index) => (
        <BreadcrumbPathElement {...part} key={`path_element_${index}`} />
      ))}
    </div>
  );
}

export default BreadcrumbNavigation;
