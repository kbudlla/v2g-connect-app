import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Button, Input, Modal, Spin, Typography } from 'antd';

import { ChargingReceipt } from 'utils/simulation';

import Card, { ForwardedCardProps } from '../Card/Card';
import ChargingReceiptsTable from '../ChargingReceiptsTable/ChargingReceiptsTable';

/* Modal */

type ChargingReceiptsModalProps = {
  open: boolean;
  onClose: () => void;
  loading?: boolean;
  data?: ChargingReceipt[];
};

function ChargingReceiptsModal(props: ChargingReceiptsModalProps): JSX.Element {
  const { open, data, loading } = props;
  const { t } = useTranslation('common');

  return (
    <Modal
      open={open}
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
          {t('receiptsTitle')}
        </Typography.Title>
        <Input placeholder={t('search') ?? ''} />
      </div>

      {/* Content */}
      <div className="challenges-modal-content-wrapper">
        {loading && <Spin style={{ margin: 'auto' }} />}
        {!loading && data && <ChargingReceiptsTable pagination receipts={data} />}
      </div>
    </Modal>
  );
}

type ChargingReceiptsCardProps = {
  limit?: number;
  receipts?: ChargingReceipt[];
};

function ChargingReceiptsCard(props: ForwardedCardProps<ChargingReceiptsCardProps>): JSX.Element {
  const { receipts, limit, loading } = props;
  const { t } = useTranslation('common');

  const [modalOpen, setModalOpen] = useState(false);

  const data = useMemo(() => {
    if (!limit) return receipts ?? [];
    return receipts ? receipts.slice(0, limit) : [];
  }, [limit, receipts]);

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
            {t('receiptsTitle')}
          </Typography.Title>

          <Button type="primary" onClick={handleModalOpen}>
            {t('showAll')}
          </Button>
        </div>
      }
      {...props}
    >
      <ChargingReceiptsTable pagination={!limit} receipts={data} />
      <ChargingReceiptsModal open={modalOpen} onClose={handleModalClose} loading={loading} data={receipts} />
    </Card>
  );
}

export default ChargingReceiptsCard;
