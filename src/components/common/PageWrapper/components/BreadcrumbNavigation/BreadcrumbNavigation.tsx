import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router';

import { getThreadTitle } from 'api/forum';

import { Typography } from 'antd';

import { clsx } from 'clsx';

type PathElement = {
  title: string;
  url: string;
};

const useBreadcrumbPath = () => {
  const { pathname } = useLocation();
  const { t } = useTranslation('common');
  const [pathElements, setPathElements] = useState<PathElement[]>([]);

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

  useEffect(() => {
    const updatePathElements = async (): Promise<PathElement[]> => {
      const parts = pathname.split('/').filter((e) => e);
      const basePathName = pathname.replace(/^(\/[^/]+)(\/.+)$/, '$1');
      const isForum = basePathName === '/community';

      // We can already transform the elements
      const pathElements = parts.slice(0, isForum ? 1 : 2).map((part, index, parts) => {
        const path = parts.filter((_, ii) => ii < index).join('/');
        return {
          title: translatedPathNameMap[part] ?? part,
          url: path ? `/${path}/${part}` : `/${part}`,
        };
      });
      console.log(parts);

      // And we're done if we're not in the forum
      if (!isForum || parts.length !== 2) return pathElements;

      // Check if we're looking at a thread
      // And if yes, resolve it's name
      const threadName = await getThreadTitle(parts[1]);

      // For each of the parts, we can get both the human-readable title
      // and the corresponding URL
      return [
        ...pathElements,
        // Extra Path element for Forum thread
        ...(isForum && parts.length === 2
          ? [
              {
                title: threadName.data ?? 'Error',
                url: pathname,
              },
            ]
          : []),
      ];
    };

    updatePathElements().then((pathElements) => setPathElements(pathElements));
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
    <Typography.Text className={clsx('breadcrumb-navigation-text', { selected: selected })} onClick={handleClick}>
      {title}
    </Typography.Text>
  );
}

function BreadcrumbNavigation(): JSX.Element {
  const pathElements = useBreadcrumbPath();
  return (
    <div className="breadcrumb-wrapper flex gap-2 flex-wrap">
      {pathElements.map((part, index) => (
        <BreadcrumbPathElement {...part} key={`path_element_${index}`} />
      ))}
    </div>
  );
}

export default BreadcrumbNavigation;
