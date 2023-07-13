import { useRef } from 'react';

import { Table, TableProps } from 'antd';

import { useResponsiveDimensions } from 'utils/hooks';
import { ChargingReceipt } from 'utils/simulation';
import { formatKWhValue, halfSpace } from 'utils/units';

import { green } from '@ant-design/colors';
import moment from 'moment';

const columns: TableProps<ChargingReceipt>['columns'] = [
  {
    title: 'Location',
    dataIndex: 'location',
    key: 'location',
    ellipsis: {
      showTitle: true,
    },
  },
  {
    title: 'Date',
    dataIndex: 'timestamp',
    key: 'timestamp',
    render: (value) => <span className="whitespace-nowrap">{moment(value).format('LL')}</span>,
  },
  {
    title: () => (
      // This is required for some reason, to make it not break the title
      <span className="whitespace-nowrap block text-center">Charged</span>
    ),
    dataIndex: 'chargedKWh',
    key: 'chargedKWh',
    render: (value) => <span className="whitespace-nowrap w-20 block text-center">{formatKWhValue(value)}</span>,
  },
  {
    title: () => (
      // This is required for some reason, to make it not break the title
      <span className="whitespace-nowrap block text-center">Discharged</span>
    ),
    dataIndex: 'dischargedKWh',
    key: 'dischargedKWh',
    render: (value) => <span className="whitespace-nowrap w-20 block text-center">{formatKWhValue(value)}</span>,
  },
  {
    title: () => <span className="text-center w-full block">V2G Earnings</span>,
    dataIndex: 'earnings',
    key: 'earnings',
    render: (value) => (
      <span className="whitespace-nowrap w-24 text-right block" style={{ color: green[7] }}>
        {`${value.toFixed(2)}${halfSpace}€`}
      </span>
    ),
  },
  {
    title: () => <span className="text-center w-full block">Cost</span>,
    dataIndex: 'totalCost',
    key: 'totalCost',
    render: (value) => (
      <span className="whitespace-nowrap w-14 text-right block">{`${value.toFixed(2)}${halfSpace}€`}</span>
    ),
  },
];

type ChargingReceiptsTableProps = {
  receipts: ChargingReceipt[];
  pagination?: boolean;
};

function ChargingReceiptsTable(props: ChargingReceiptsTableProps): JSX.Element {
  const { receipts, pagination } = props;

  const rootElementRef = useRef<HTMLDivElement | null>(null);
  const { boundingBox } = useResponsiveDimensions(rootElementRef);

  console.log(receipts);

  return (
    <div className="w-full h-full overflow-hidden" ref={rootElementRef}>
      <Table
        className="max-w-full"
        dataSource={receipts}
        columns={columns}
        pagination={
          pagination
            ? {
                defaultPageSize: 10,
                pageSizeOptions: [5, 10, 20],
                responsive: true,
              }
            : false
        }
        scroll={{
          x: true,
          y: (boundingBox?.height ?? 0) - 55 - (pagination ? 64 : 0),
        }}
        rowKey={(row) => row.timestamp}
      />
    </div>
  );
}

export default ChargingReceiptsTable;
