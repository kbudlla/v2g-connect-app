import { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { LeaderboardUser, useLeaderboard } from 'api/sustainability';

import { Button, Input, Table, TableProps } from 'antd';

import Card, { CardProps } from 'components/common/Card/Card';
import Modal from 'components/common/Modal/Modal';

import { useResponsiveDimensions } from 'utils/hooks';

import CardHeader from '../Card/CardHeader';

/* Columns */

const columns: TableProps<LeaderboardUser>['columns'] = [
  {
    title: '#',
    dataIndex: 'position',
    key: 'position',
  },
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: 'Location',
    dataIndex: 'location',
    key: 'location',
  },
  {
    title: () => <span className="whitespace-nowrap">Points</span>,
    dataIndex: 'points',
    key: 'points',
  },
];

/* Modal */

type LeaderboardModalProps = {
  open: boolean;
  onClose: () => void;
};

function LeaderboardModal(props: LeaderboardModalProps): JSX.Element {
  const { t } = useTranslation('common');
  const { loading, leaderboard } = useLeaderboard();

  const rootElementRef = useRef<HTMLDivElement | null>(null);
  const { boundingBox } = useResponsiveDimensions(rootElementRef);

  return (
    <Modal
      loading={loading}
      open={props.open}
      onClose={props.onClose}
      header={
        <CardHeader title={t('leaderboard')}>
          <Input placeholder={t('search') ?? ''} />
        </CardHeader>
      }
      width="40rem"
      className="!max-h-screen"
    >
      <div className="w-full h-full overflow-hidden" ref={rootElementRef}>
        <Table
          dataSource={leaderboard}
          columns={columns}
          pagination={{
            defaultPageSize: 10,
            pageSizeOptions: [5, 10, 20],
            responsive: true,
          }}
          scroll={{
            x: true,
            y: (boundingBox?.height ?? 0) - 56 - 56,
          }}
          rowKey={(row) => row.id}
        />
      </div>
    </Modal>
  );
}

/* Main Component */

type LeaderboardCardProps = Omit<CardProps, 'header' | 'loading'>;

function LeaderboardCard(props: LeaderboardCardProps): JSX.Element {
  const { t } = useTranslation('common');
  const { loading, leaderboard } = useLeaderboard(6);
  const [modalOpen, setModalOpen] = useState(false);

  const handleModalOpen = useCallback(() => {
    setModalOpen(true);
  }, []);

  const handleModalClose = useCallback(() => {
    setModalOpen(false);
  }, []);

  return (
    <>
      <Card
        header={
          <CardHeader title={t('leaderboard')}>
            <Button type="primary" onClick={handleModalOpen}>
              {t('showAll')}
            </Button>
          </CardHeader>
        }
        loading={loading}
        {...props}
      >
        <Table
          dataSource={leaderboard}
          columns={columns}
          pagination={false}
          scroll={{
            x: true,
          }}
          rowKey={(row) => row.id}
        />
      </Card>
      <LeaderboardModal open={modalOpen} onClose={handleModalClose} />
    </>
  );
}

export default LeaderboardCard;
