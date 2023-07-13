import { useRef, useState } from 'react';

import { Avatar, Table, TableProps } from 'antd';

import Card from 'components/common/Card/Card';
import PageWrapper from 'components/common/PageWrapper/PageWrapper';

import { useResponsiveDimensions } from 'utils/hooks';
import { unitToMs } from 'utils/time';

import { faker } from '@faker-js/faker';
import { ReactComponent as ViewsIcon } from 'assets/icons/material/eye-outline.svg';
import { ReactComponent as RepliesIcon } from 'assets/icons/material/message-reply-text.svg';
import userImage from 'assets/images/users/user.png';
import moment from 'moment';

type ForumThreadSummary = {
  title: string;
  created: string;
  author: {
    id: string;
    name: string;
    image: string;
  };
  repliesCount: number;
  viewsCount: number;
};

const generateMockForumThreadSummary = (): ForumThreadSummary => {
  const repliesCount = Math.floor(Math.random() * 50);
  const viewsCount = Math.floor(repliesCount * (1 + Math.random()));
  return {
    title: faker.helpers.arrayElement([
      'Show us your EV!',
      'HEVRA - EV-friendly garage',
      'EV rental in Munich',
      "Offtopic - What's the best university in Munich?",
      'Climate Change Committee - Better transparency is no substitute for real delivery',
      // TODO! add some more funny stuff here.
    ]),
    author: {
      id: faker.string.uuid(),
      image: userImage,
      name: faker.person.fullName(),
    },
    created: new Date(Date.now() - Math.floor(Math.random() * 7 * unitToMs('days'))).toISOString(),
    repliesCount,
    viewsCount,
  };
};

const generateMockForumThreadSummaries = (n: number) =>
  faker.helpers.multiple(generateMockForumThreadSummary, { count: n });

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

function ForumScreen(): JSX.Element {
  const [summaries] = useState(generateMockForumThreadSummaries(10));

  const rootElementRef = useRef<HTMLDivElement | null>(null);
  const { boundingBox } = useResponsiveDimensions(rootElementRef);

  console.log(boundingBox?.height);

  return (
    <PageWrapper showBreadcrumbs>
      <Card className="flex-1 basis-1" fixedheight>
        <div className="flex-1 min-h-0 overflow-hidden" ref={rootElementRef}>
          <Table
            columns={columns}
            dataSource={summaries}
            scroll={{
              scrollToFirstRowOnChange: true,
              y: (boundingBox?.height ?? 0) - 55 - 64,
            }}
          />
        </div>
      </Card>
    </PageWrapper>
  );
}

export default ForumScreen;
