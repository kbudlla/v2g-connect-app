import { useCallback } from 'react';
import { useNavigate } from 'react-router';

import { ForumThreadSummary, usePaginatedForumOverview } from 'api/forum';

import { Avatar, Col, Pagination, Row, Typography } from 'antd';

import Card from 'components/common/Card/Card';

import { ReactComponent as ViewsIcon } from 'assets/icons/material/eye-outline.svg';
import { ReactComponent as RepliesIcon } from 'assets/icons/material/message-reply-text.svg';
import moment from 'moment';

const initialPageSize = 10;

type ThreadOverviewCardProps = {
  thread: ForumThreadSummary;
  onClick?: (thread: ForumThreadSummary) => void;
};

function ThreadOverviewCard(props: ThreadOverviewCardProps): JSX.Element {
  const { thread, onClick } = props;

  const handleClick = useCallback(() => {
    onClick?.(thread);
  }, [thread, onClick]);

  return (
    <Card onClick={handleClick}>
      <Row gutter={[32, 16]}>
        {/* Author */}
        <Col span={24} md={14} xl={16} className="flex gap-3">
          <Avatar size="large" src={thread.author.image} className="my-auto flex-shrink-0" />
          <span className="flex flex-col gap-2">
            <span className="font-medium text-lg" style={{ color: '#383838' }}>
              {thread.title}
            </span>
            <span className="flex gap-5">
              <span className="font-medium text-sm" style={{ color: '#383838' }}>
                {thread.author.name}
              </span>
              <span className="font-medium text-sm" style={{ color: '#868D97' }}>
                {' '}
                {moment(thread.created).format('LL')}{' '}
              </span>
            </span>
          </span>
        </Col>

        {/* Stats */}
        <Col span={24} md={10} xl={8} className="flex justify-end gap-4" style={{ color: '#868D97' }}>
          {/* Replies */}
          <span className="flex">
            <RepliesIcon width={16} height={16} className="my-auto" />
            <Typography.Text className="my-auto ml-2 mr-1 font-medium" style={{ color: '#868D97' }}>
              {thread.repliesCount} Replies
            </Typography.Text>
          </span>
          <span className="flex">
            <ViewsIcon width={16} height={16} className="my-auto" />
            <Typography.Text className="my-auto ml-2 mr-1 font-medium" style={{ color: '#868D97' }}>
              {thread.viewsCount} Views
            </Typography.Text>
          </span>
        </Col>
      </Row>
    </Card>
  );
}

/* Main Component */

function ThreadOverview(): JSX.Element {
  const navigate = useNavigate();

  const { loading, handlePaginationChange, summaries, total, page, pageSize } =
    usePaginatedForumOverview(initialPageSize);

  const handleRowClick = useCallback(
    (thread: ForumThreadSummary) => {
      navigate(thread.id);
    },
    [navigate],
  );

  return (
    <Card
      className="flex-1 basis-1"
      fixedheight
      disablePadding
      loading={loading}
      footer={
        <div className="flex justify-end p-4">
          <Pagination
            total={total}
            defaultPageSize={initialPageSize}
            pageSizeOptions={[5, initialPageSize, 20]}
            current={page}
            pageSize={pageSize}
            onChange={handlePaginationChange}
            disabled={loading}
          />
        </div>
      }
    >
      <div className="flex-1 min-h-0 h-0 p-4 overflow-y-auto flex flex-col gap-4">
        {summaries.map((thread) => (
          <ThreadOverviewCard key={thread.id} thread={thread} onClick={handleRowClick} />
        ))}
      </div>
    </Card>
  );
}

export default ThreadOverview;
