import { useCallback, useState } from 'react';

import { Button, Input, Modal, Progress, Table, TableProps, Typography } from 'antd';

import Card from 'components/common/Card/Card';

import { green, grey } from '@ant-design/colors';
import { CheckCircleFilled as DoneIcon } from '@ant-design/icons';

type LeaderboardProps = {
  style?: React.CSSProperties;
};

const generateFakeChallenge = (index: number) => ({
  key: index,
  name: `GreatChallenge #${index}`,
  points: Math.floor(Math.random() * 100) + 100,
  completion:
    Math.random() > 0.5
      ? { done: true, count: 10, total: 10 }
      : {
          done: false,
          count: Math.floor(Math.random() * 9),
          total: 10,
        },
});

const generateChallenges = (n: number) => new Array(n).fill(0).map((_, i) => generateFakeChallenge(i + 1));

type ChallengeRecord = ReturnType<typeof generateFakeChallenge>;

const columns: TableProps<ChallengeRecord>['columns'] = [
  {
    title: 'Challenge',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: 'Rewarded points',
    dataIndex: 'points',
    key: 'points',
  },
  {
    title: 'Progress',
    dataIndex: 'completion',
    key: 'completion',
    render: (_, { completion: { done, total, count } }) => {
      const progressPercent = (count / total) * 100;
      return (
        <Progress
          percent={progressPercent}
          steps={total}
          size="small"
          strokeColor={new Array(total).fill(0).map((_, i) => (i < count ? green[7] : grey[6]))}
          // Yes we need to use style here, because the color prop is not forwarded correctly
          format={() => (done ? <DoneIcon style={{ color: green[7] }} /> : `${count}/${total}`)}
        />
      );
    },
  },
];

type ChallengesModalProps = {
  open: boolean;
  onClose: () => void;
};

function ChallengesModal(props: ChallengesModalProps): JSX.Element {
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
          dataSource={generateChallenges(100)}
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

function Challenges(props: LeaderboardProps): JSX.Element {
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
        <div className="challenges-card-header">
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
            Challenges
          </Typography.Title>

          <Button type="primary" onClick={handleModalOpen}>
            See All
          </Button>
        </div>
      }
      style={props.style}
    >
      <Table dataSource={generateChallenges(6)} columns={columns} pagination={false} />
      <ChallengesModal open={modalOpen} onClose={handleModalClose} />
    </Card>
  );
}

export default Challenges;
