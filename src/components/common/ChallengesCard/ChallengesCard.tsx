import { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Challenge, useChallenges } from 'api/sustainability';

import { Button, Input, Progress, Table, TableProps } from 'antd';

import Card, { CardProps } from 'components/common/Card/Card';
import Modal from 'components/common/Modal/Modal';

import { useResponsiveDimensions } from 'utils/hooks';

import CardHeader from '../Card/CardHeader';

import { green, grey } from '@ant-design/colors';
import { CheckCircleFilled as DoneIcon } from '@ant-design/icons';
import { ReactComponent as EcoCoinIcon } from 'assets/icons/material/leaf-circle-outline.svg';

/* Columns */

const columns: TableProps<Challenge>['columns'] = [
  {
    title: 'Challenge',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: () => (
      // This is required for some reason, to make it not break the title
      <span className="whitespace-nowrap">Reward</span>
    ),
    dataIndex: 'points',
    key: 'points',
    render: (value) => (
      <span className="flex gap-1">
        <span className="my-auto">{value}</span>
        <EcoCoinIcon className="my-auto w-4 h-4" />
      </span>
    ),
  },
  {
    title: 'Progress',
    dataIndex: 'completion',
    key: 'completion',
    render: (_, { completion: { done, total, count, discrete } }) => {
      const progressPercent = (count / total) * 100;
      return (
        <span className="flex justify-start">
          <Progress
            percent={progressPercent}
            steps={discrete ? total : undefined}
            size="small"
            strokeColor={new Array(total).fill(0).map((_, i) => (i < count ? green[7] : grey[6]))}
            // Yes we need to use style here, because the color prop is not forwarded correctly
            format={() => (done ? <DoneIcon style={{ color: green[7] }} /> : `${count}/${total}`)}
          />
        </span>
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
  const { open, onClose } = props;
  const { t } = useTranslation('common');
  const { loading, challenges } = useChallenges();

  const rootElementRef = useRef<HTMLDivElement | null>(null);
  const { boundingBox } = useResponsiveDimensions(rootElementRef);

  return (
    <Modal
      loading={loading}
      open={open}
      onClose={onClose}
      header={
        <CardHeader title={t('challenges')}>
          <Input placeholder={t('search') ?? ''} />
        </CardHeader>
      }
      width="40rem"
      className="!max-h-screen"
    >
      <div className="w-full h-full overflow-hidden" ref={rootElementRef}>
        <Table
          dataSource={challenges}
          columns={columns}
          pagination={{
            defaultPageSize: 10,
            pageSizeOptions: [5, 10, 20],
          }}
          scroll={{
            x: true,
            y: (boundingBox?.height ?? 0) - 77 - 64,
          }}
          rowKey={(row) => row.id}
        />
      </div>
    </Modal>
  );
}

/* Main Component */

type ChallengesCardProps = Omit<CardProps, 'header' | 'loading'> & { title: string; simple?: boolean };

function ChallengesCard(props: ChallengesCardProps): JSX.Element {
  const { title, simple } = props;
  const { t } = useTranslation('common');

  const [modalOpen, setModalOpen] = useState(false);

  const { loading, challenges } = useChallenges(simple ? 3 : 6);

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
          <CardHeader title={title}>
            {!simple && (
              <Button type="primary" onClick={handleModalOpen}>
                {t('showAll')}
              </Button>
            )}
          </CardHeader>
        }
        loading={loading}
        {...props}
      >
        <Table
          dataSource={challenges}
          columns={columns}
          pagination={false}
          scroll={{
            x: true,
          }}
          showHeader={!simple}
        />
      </Card>
      <ChallengesModal open={modalOpen} onClose={handleModalClose} />
    </>
  );
}

export default ChallengesCard;
