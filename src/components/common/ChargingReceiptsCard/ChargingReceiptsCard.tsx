import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Button, Input } from 'antd';

import Modal from 'components/common/Modal/Modal';

import { ChargingReceipt } from 'utils/simulation';

import Card, { ForwardedCardProps } from '../Card/Card';
import CardHeader from '../Card/CardHeader';
import ChargingReceiptsTable from '../ChargingReceiptsTable/ChargingReceiptsTable';

/* Modal */

type ChargingReceiptsModalProps = {
  open: boolean;
  onClose: () => void;
  loading?: boolean;
  data?: ChargingReceipt[];
};

function ChargingReceiptsModal(props: ChargingReceiptsModalProps): JSX.Element {
  const { open, onClose, data, loading } = props;
  const { t } = useTranslation('common');

  return (
    <Modal
      loading={loading}
      open={open}
      onClose={onClose}
      header={
        <CardHeader title={t('receiptsTitle')}>
          <Input placeholder={t('search') ?? ''} />
        </CardHeader>
      }
      width="40rem"
      className="!max-h-screen"
    >
      <ChargingReceiptsTable pagination receipts={data ?? []} />
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
        <CardHeader title={t('receiptsTitle')}>
          <Button type="primary" onClick={handleModalOpen}>
            {t('showAll')}
          </Button>
        </CardHeader>
      }
      {...props}
    >
      <ChargingReceiptsTable pagination={!limit} receipts={data} />
      <ChargingReceiptsModal open={modalOpen} onClose={handleModalClose} loading={loading} data={receipts} />
    </Card>
  );
}

export default ChargingReceiptsCard;
