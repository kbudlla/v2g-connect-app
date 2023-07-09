import { useCallback, useState } from 'react';

import { Button, Input, Modal, Table, Typography } from 'antd';

import Card from 'components/common/Card/Card';

type LeaderboardProps = {
  style?: React.CSSProperties;
};

const generateFakeUserStats = (index: number, n: number) => ({
  key: index,
  name: `FakeUser #${index}`,
  location: 'Munich',
  points: Math.floor(Math.random() * 100) + (n - index) * 1000,
});

const userStats = (n: number) => new Array(n).fill(0).map((_, i) => generateFakeUserStats(i + 1, n));

const columns = [
  {
    title: '',
    dataIndex: 'key',
    key: 'key',
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

type LeaderboardModalProps = {
  open: boolean;
  onClose: () => void;
};

function LeaderboardModal(props: LeaderboardModalProps): JSX.Element {
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
        <Table
          dataSource={userStats(100)}
          columns={columns}
          pagination={{
            defaultPageSize: 10,
            pageSizeOptions: [5, 10, 20],
          }}
        />
      </div>
    </Modal>
  );
}

function Leaderboard(props: LeaderboardProps): JSX.Element {
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
      <Table dataSource={userStats(6)} columns={columns} pagination={false} />
      <LeaderboardModal open={modalOpen} onClose={handleModalClose} />
    </Card>
  );
}

export default Leaderboard;
