import { useCallback, useState } from 'react';

import { LeaderboardUser, useLeaderboard } from 'api/sustainability';

import { Button, Input, Modal, Spin, Table, TableProps, Typography } from 'antd';

import Card from 'components/common/Card/Card';

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
    title: 'Points',
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
  const { loading, leaderboard } = useLeaderboard();

  return (
    <Modal
      open={props.open}
      onCancel={props.onClose}
      footer={null}
      centered
      className="leaderboard-modal-root"
      style={{ width: '' }}
    >
      {/* Title */}
      <div className="leaderboard-modal-title-wrapper">
        <Typography.Title
          level={2}
          type="success"
          style={{
            margin: 0,
            fontSize: '26px',
            lineHeight: '36px',
            letterSpacing: '-0.2px',
          }}
        >
          Leaderboards
        </Typography.Title>
        <Input placeholder="Search" />
      </div>

      {/* Content */}
      <div>
        {loading && <Spin style={{ margin: 'auto' }} />}
        {!loading && (
          <Table
            dataSource={leaderboard}
            columns={columns}
            pagination={{
              defaultPageSize: 10,
              pageSizeOptions: [5, 10, 20],
            }}
          />
        )}
      </div>
    </Modal>
  );
}

/* Main Component */

type LeaderboardProps = {
  style?: React.CSSProperties;
};

function Leaderboard(props: LeaderboardProps): JSX.Element {
  const { loading, leaderboard } = useLeaderboard(6);
  const [modalOpen, setModalOpen] = useState(false);

  const handleModalOpen = useCallback(() => {
    setModalOpen(true);
  }, []);

  const handleModalClose = useCallback(() => {
    setModalOpen(false);
  }, []);

  return (
    <Card
      header={
        <div className="leaderboard-card-header">
          <Typography.Title
            level={2}
            type="success"
            style={{
              margin: 0,
              fontSize: '26px',
              lineHeight: '36px',
              letterSpacing: '-0.2px',
            }}
          >
            Leaderboards
          </Typography.Title>

          <Button type="primary" onClick={handleModalOpen}>
            See All
          </Button>
        </div>
      }
      style={props.style}
    >
      {loading && <Spin style={{ margin: 'auto' }} />}
      {!loading && <Table dataSource={leaderboard} columns={columns} pagination={false} />}
      <LeaderboardModal open={modalOpen} onClose={handleModalClose} />
    </Card>
  );
}

export default Leaderboard;
