import { useCallback, useRef } from 'react';
import { useNavigate } from 'react-router';

import { ForumThreadSummary, usePaginatedForumOverview } from 'api/forum';

import { Avatar, Table, TableProps } from 'antd';

import Card from 'components/common/Card/Card';

import { useResponsiveDimensions } from 'utils/hooks';

import { ReactComponent as ViewsIcon } from 'assets/icons/material/eye-outline.svg';
import { ReactComponent as RepliesIcon } from 'assets/icons/material/message-reply-text.svg';
import moment from 'moment';

const columns: TableProps<ForumThreadSummary>['columns'] = [
  {
    title: 'Topic',
    key: 'title',
    render: (_, row) => (
      <span className="flex gap-3">
        <Avatar size="large" src={row.author.image} className="my-auto flex-shrink-0" />
        <span className="flex flex-col gap-2">
          <span className="font-medium text-lg" style={{ color: '#383838' }}>
            {row.title}
          </span>
          <span className="flex gap-5">
            <span className="font-medium text-sm" style={{ color: '#383838' }}>
              {row.author.name}
            </span>
            <span className="font-medium text-sm" style={{ color: '#868D97' }}>
              {' '}
              {moment(row.created).format('LL')}{' '}
            </span>
          </span>
        </span>
      </span>
    ),
  },
  {
    title: 'Replies',
    dataIndex: 'repliesCount',
    key: 'repliesCount',
    width: 96,
    render: (value: number) => (
      <span className="flex flex-col">
        <span className="flex gap-1 justify-end" style={{ color: '#535353' }}>
          <span className="my-auto font-bold text-base">{value}</span>
          <RepliesIcon width={18} height={18} className="my-auto" />
        </span>
        <span className="text-base text-right" style={{ color: '#868D97' }}>
          Replies
        </span>
      </span>
    ),
  },
  {
    title: 'Views',
    dataIndex: 'viewsCount',
    key: 'viewsCount',
    width: 96,
    render: (value: number) => (
      <span className="flex flex-col">
        <span className="flex gap-1 justify-end" style={{ color: '#535353' }}>
          <span className="my-auto font-bold text-base">{value}</span>
          <ViewsIcon width={18} height={18} className="my-auto" />
        </span>
        <span className="text-base text-right" style={{ color: '#868D97' }}>
          Views
        </span>
      </span>
    ),
  },
];

const initialPageSize = 10;

function ThreadOverview(): JSX.Element {
  const navigate = useNavigate();

  const { loading, handlePaginationChange, summaries, total } = usePaginatedForumOverview(initialPageSize);

  // Dynamically adjust the inner size of the table based on container size
  const rootElementRef = useRef<HTMLDivElement | null>(null);
  const { boundingBox } = useResponsiveDimensions(rootElementRef);

  const handleRow: TableProps<ForumThreadSummary>['onRow'] = useCallback(
    (summary: ForumThreadSummary) => ({
      onClick: () => {
        navigate(btoa(`${summary.title}|${summary.id}`));
      },
    }),
    [navigate],
  );

  return (
    <Card className="flex-1 basis-1" fixedheight loading={loading}>
      <div className="flex-1 min-h-0 overflow-hidden" ref={rootElementRef}>
        <Table
          columns={columns}
          dataSource={summaries}
          pagination={{
            total,
            defaultPageSize: initialPageSize,
            pageSizeOptions: [initialPageSize],
            onChange: handlePaginationChange,
          }}
          scroll={{
            scrollToFirstRowOnChange: true,
            y: (boundingBox?.height ?? 0) - 55 - 64,
          }}
          onRow={handleRow}
        />
      </div>
    </Card>
  );
}

export default ThreadOverview;
