import { useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router';

import { Typography } from 'antd';

import { clsx } from 'clsx';

const PathNameMap: Record<string, string> = {
  sustainability: 'Sustainability Tracker',
};

const useBreadcrumbPath = () => {
  const location = useLocation();
  const pathElements = useMemo(() => {
    const parts = location.pathname.split('/').filter((e) => e);

    // For each of the parts, we can get both the human-readable title
    // and the corresponding URL
    return parts.map((part, index, parts) => {
      const path = parts.filter((_, ii) => ii < index).join('/');
      return {
        title: PathNameMap[part] ?? part,
        url: path ? `/${path}/${part}` : `/${part}`,
      };
    });
  }, []);
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
    <div>
      {pathElements.map((part, index) => (
        <BreadcrumbPathElement {...part} key={`path_element_${index}`} />
      ))}
    </div>
  );
}

export default BreadcrumbNavigation;
