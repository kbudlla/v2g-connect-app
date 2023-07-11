import { Table, TableProps } from 'antd';

import { ChargingReceipt } from 'utils/simulation';
import { formatKWhValue, halfSpace } from 'utils/units';

import moment from 'moment';

const columns: TableProps<ChargingReceipt>['columns'] = [
  {
    title: 'Location',
    dataIndex: 'location',
    key: 'location',
  },
  {
    title: 'Date',
    dataIndex: 'timestamp',
    key: 'timestamp',
    render: (value) => moment(value).format('LL'),
  },
  {
    title: 'Charged',
    dataIndex: 'chargedKWh',
    key: 'chargedKWh',
    render: (value) => formatKWhValue(value),
  },
  {
    title: 'Discharged',
    dataIndex: 'dischargedKWh',
    key: 'dischargedKWh',
    render: (value) => formatKWhValue(value),
  },
  {
    title: 'Cost',
    dataIndex: 'totalCost',
    key: 'totalCost',
    render: (value) => `${value.toFixed(2)}${halfSpace}€`,
  },
];

type ChargingReceiptsTableProps = {
  receipts: ChargingReceipt[];
  pagination?: boolean;
};

function ChargingReceiptsTable(props: ChargingReceiptsTableProps): JSX.Element {
  const { receipts, pagination } = props;

  return (
    <Table
      dataSource={receipts}
      columns={columns}
      pagination={
        pagination
          ? {
              defaultPageSize: 10,
              pageSizeOptions: [5, 10, 20],
            }
          : false
      }
      rowKey={(row) => row.timestamp}
    />
  );
}

export default ChargingReceiptsTable;
