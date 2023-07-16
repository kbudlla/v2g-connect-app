import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useChallenges } from 'api/sustainability';

import { Button, Input, Modal, Pagination, Spin, Typography } from 'antd';

import Card, { CardProps } from 'components/common/Card/Card';

import CardHeader from '../Card/CardHeader';
import RoundedIconContainer from '../RoundedIconContainer/RoundedIconContainer';

import { faker } from '@faker-js/faker';
import { ReactComponent as EcoCoinIcon } from 'assets/icons/material/leaf-circle-outline.svg';
import { ReactComponent as RewardIcon } from 'assets/icons/material/wallet-giftcard.svg';
import moment from 'moment';

type Offer = {
  id: string;
  title: string;
  description: string;
  expiry: Date;
  cost: number;
};

const generateMockOffer = (): Offer => ({
  id: faker.string.uuid(),
  title: faker.commerce.productName(),
  description: faker.commerce.productDescription(),
  expiry: moment()
    .add(Math.floor(Math.random() * 40 + 10), 'days')
    .toDate(),
  cost: [100, 200, 400, 1000][Math.floor(Math.random() * 4)],
});

const generateMockOffers = (n: number) => faker.helpers.multiple(generateMockOffer, { count: n });

/* Modal */

type ChallengesModalProps = {
  open: boolean;
  onClose: () => void;
};

function ChallengesModal(props: ChallengesModalProps): JSX.Element {
  const { t } = useTranslation('common');
  const { loading } = useChallenges();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [offers, setOffers] = useState(generateMockOffers(200));
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(6);

  const handlePaginationChange = useCallback((page: number, pageSize: number) => {
    // TODO Take into account, that when the page size changes, the page # should also
    // change?
    setPage(page);
    setPageSize(pageSize);
  }, []);

  const selected = useMemo(() => {
    const start = page * pageSize;
    const end = start + pageSize;
    return offers.slice(start, end);
  }, [page, pageSize, offers]);

  return (
    <Modal
      open={props.open}
      onCancel={props.onClose}
      footer={null}
      centered
      className="offers-modal-root"
      style={{ width: '' }}
    >
      {/* Title */}
      <div className="offers-modal-title-wrapper">
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
          {t('rewardsOffersCardTitle')}
        </Typography.Title>
        <Input placeholder={t('search') ?? ''} />
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col w-full h-full">
        {loading && <Spin style={{ margin: 'auto' }} />}
        <div className="flex-1 grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-6">
          {selected.map((offer) => (
            <OfferCard key={offer.id} offer={offer} currentPoints={420} />
          ))}
        </div>
        <div className="flex justify-end">
          <Pagination
            current={page}
            pageSize={pageSize}
            onChange={handlePaginationChange}
            total={offers.length}
            pageSizeOptions={[3, 6, 9]}
          />
        </div>
      </div>
    </Modal>
  );
}

type OfferCardProps = {
  offer: Offer;
  onRedeem?: (id: string) => void;
  currentPoints: number;
};
function OfferCard(props: OfferCardProps): JSX.Element {
  const {
    offer: { cost, id, title, expiry },
    onRedeem,
    currentPoints,
  } = props;

  const { disabled } = useMemo(
    () => ({
      disabled: cost > currentPoints,
    }),
    [cost, currentPoints],
  );

  const handleRedeem = useCallback(() => {
    if (disabled) return;
    onRedeem?.(id);
  }, [onRedeem, disabled, id]);

  return (
    <Card className="border border-dashed border-gray-400">
      <div className="flex flex-row mb-5">
        <RoundedIconContainer
          Icon={RewardIcon}
          size={30}
          color="#12A42F"
          backgroundColor="#EDFFEF"
          className="my-auto mr-4"
        />
        <Typography.Title level={4} className="font-medium my-auto">
          {title}
        </Typography.Title>
      </div>
      <div className="flex flex-row justify-between">
        <div className="flex flex-col">
          <Typography.Text className="text-sm" style={{ color: '#868D97' }}>
            Expires
          </Typography.Text>
          <Typography.Text className="text-base font-medium">{moment(expiry).format('LL')}</Typography.Text>
        </div>
        <Button type="primary" onClick={handleRedeem} className="my-auto flex h-9">
          <span className="my-auto w-6 h-6">
            <EcoCoinIcon width={24} height={24} />
          </span>
          <span className="my-auto pl-2">{cost}</span>
        </Button>
      </div>
    </Card>
  );
}

/* Main Component */

type OffersCardProps = Omit<CardProps, 'header' | 'loading'>;

function OffersCard(props: OffersCardProps): JSX.Element {
  const { t } = useTranslation('common');

  const [modalOpen, setModalOpen] = useState(false);

  const { loading } = useChallenges(6);

  const handleModalOpen = useCallback(() => {
    setModalOpen(true);
  }, []);

  const handleModalClose = useCallback(() => {
    setModalOpen(false);
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [offers, setOffers] = useState(generateMockOffers(6));

  return (
    <>
      <Card
        header={
          <CardHeader title={t('rewardsOffersCardTitle')}>
            <Button type="primary" onClick={handleModalOpen}>
              {t('showAll')}
            </Button>
          </CardHeader>
        }
        loading={loading}
        {...props}
      >
        <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {offers.map((offer) => (
            <OfferCard key={offer.id} offer={offer} currentPoints={420} />
          ))}
        </div>
        <ChallengesModal open={modalOpen} onClose={handleModalClose} />
      </Card>
    </>
  );
}

export default OffersCard;
