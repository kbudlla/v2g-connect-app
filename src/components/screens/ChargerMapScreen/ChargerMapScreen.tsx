import Card from 'components/common/Card/Card';
import ChargerMap from 'components/common/ChargerMap';
import PageWrapper from 'components/common/PageWrapper/PageWrapper';

function ChargerMapScreen(): JSX.Element {
  return (
    <PageWrapper showBreadcrumbs>
      <Card className="flex-1 basis-1" disablePadding fixedheight>
        <ChargerMap />
      </Card>
    </PageWrapper>
  );
}

export default ChargerMapScreen;
