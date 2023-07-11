import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Challenge, useChallenges } from 'api/sustainability';

import { Button, Input, Modal, Progress, Spin, Table, TableProps, Typography } from 'antd';

import Card, { CardProps } from 'components/common/Card/Card';

import { green, grey } from '@ant-design/colors';
import { CheckCircleFilled as DoneIcon } from '@ant-design/icons';

/* Columns */

const columns: TableProps<Challenge>['columns'] = [
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
    render: (_, { completion: { done, total, count, discrete } }) => {
      const progressPercent = (count / total) * 100;
      return (
        <Progress
          percent={progressPercent}
          steps={discrete ? total : undefined}
          size="small"
          strokeColor={new Array(total).fill(0).map((_, i) => (i < count ? green[7] : grey[6]))}
          // Yes we need to use style here, because the color prop is not forwarded correctly
          format={() => (done ? <DoneIcon style={{ color: green[7] }} /> : `${count}/${total}`)}
        />
      );
    },
  },
];

/* Modal */

type ChallengesModalProps = {
  open: boolean;
  onClose: () => void;
};

function ChallengesModal(props: ChallengesModalProps): JSX.Element {
  const { t } = useTranslation('common');
  const { loading, challenges } = useChallenges();

  return (
    <Modal
      open={props.open}
      onCancel={props.onClose}
      footer={null}
      centered
      className="challenges-modal-root"
      style={{ width: '' }}
    >
      {/* Title */}
      <div className="challenges-modal-title-wrapper">
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
          {t('challenges')}
        </Typography.Title>
        <Input placeholder={t('search') ?? ''} />
      </div>

      {/* Content */}
      <div className="challenges-modal-content-wrapper">
        {loading && <Spin style={{ margin: 'auto' }} />}
        {!loading && (
          <Table
            dataSource={challenges}
            columns={columns}
            pagination={{
              defaultPageSize: 10,
              pageSizeOptions: [5, 10, 20],
            }}
            rowKey={(row) => row.id}
          />
        )}
      </div>
    </Modal>
  );
}

/* Main Component */

type ChallengesCardProps = Omit<CardProps, 'header' | 'loading'>;

function ChallengesCard(props: ChallengesCardProps): JSX.Element {
  const { t } = useTranslation('common');

  const [modalOpen, setModalOpen] = useState(false);

  const { loading, challenges } = useChallenges(6);

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
              {t('challenges')}
            </Typography.Title>

            <Button type="primary" onClick={handleModalOpen}>
              {t('showAll')}
            </Button>
          </div>
        }
        loading={loading}
        {...props}
      >
        <Table dataSource={challenges} columns={columns} pagination={false} />
      </Card>
      <ChallengesModal open={modalOpen} onClose={handleModalClose} />
    </>
  );
}

export default ChallengesCard;
