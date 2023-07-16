import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router';

import { ForumMessage, usePaginatedForumThread } from 'api/forum';

import { Avatar, Button, Col, Divider, FloatButton, Pagination, Row, Typography } from 'antd';

import Card from 'components/common/Card/Card';
import CardHeader from 'components/common/Card/CardHeader';
import Collapse from 'components/common/Collapse/Collapse';

import { CloseOutlined as CloseIcon } from '@ant-design/icons';
import { ReactComponent as ReplyIcon } from 'assets/icons/material/reply.svg';
import moment from 'moment';

const initialPageSize = 6;

function ForumMessageElement(message: ForumMessage): JSX.Element {
  return (
    <Card fullwidth>
      <div className="min-h-fit">
        <Typography.Text>{message.content}</Typography.Text>
        <Divider />
        <div className="flex gap-4">
          <Avatar size="large" src={message.author.image} className="my-auto" />

          {/* Name and Date */}
          <span className="flex flex-col gap-2 my-auto">
            <span className="flex flex-col gap-2">
              <span className="font-medium text-sm" style={{ color: '#383838' }}>
                {message.author.name}
              </span>
              <span className="font-medium text-xs" style={{ color: '#868D97' }}>
                {' '}
                {moment(message.created).format('LLLL')}{' '}
              </span>
            </span>
          </span>

          <span className="flex-1" />

          {/* Extra, interactive elements? */}
        </div>
      </div>
    </Card>
  );
}

type ForumReplyFormProps = {
  onCancel?: () => void;
  onSubmit?: (post: string) => void;
};

function ForumReplyForm(props: ForumReplyFormProps): JSX.Element {
  const { onCancel, onSubmit } = props;
  const [time, setTime] = useState(moment().format('LLLL'));
  const [content, setContent] = useState('');

  useEffect(() => {
    const intervalId = setInterval(() => {
      setTime(moment().format('LLLL'));
    }, 60 * 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  const handleCancel = useCallback(() => {
    onCancel?.();
  }, []);

  const handleSubmit = useCallback(() => {
    onSubmit?.(content);
    setContent('');
  }, [content]);

  return (
    <Card
      fullwidth
      disablePadding
      header={
        <Button shape="circle" type="text" className="ml-auto" onClick={handleCancel}>
          <CloseIcon />
        </Button>
      }
    >
      <div className="px-4 pb-4">
        {/* TextField */}
        <Typography.Paragraph
          editable={{
            onChange: setContent,
            text: content,
            editing: true,
            autoSize: { minRows: 3, maxRows: 8 },
          }}
          className="!mt-2"
          style={{
            insetInline: '0',
          }}
        >
          {content}
        </Typography.Paragraph>

        <Divider className="!my-2" />
        <Row gutter={[32, 16]}>
          <Col span={24} md={12} className="flex gap-4">
            <Avatar size="large" className="my-auto" />

            {/* Name and Date */}
            <span className="flex flex-col gap-2 my-auto">
              <span className="flex flex-col gap-2">
                <span className="font-medium text-sm" style={{ color: '#383838' }}>
                  Your Name here.
                </span>
                <span className="font-medium text-xs" style={{ color: '#868D97' }}>
                  {time}
                </span>
              </span>
            </span>
          </Col>

          <Col span={24} md={12} className="flex gap-4 justify-end">
            <Button type="primary" onClick={handleSubmit} className="flex h-9">
              <span className="my-auto w-6 h-6">
                <ReplyIcon width={24} height={24} />
              </span>
              <span className="my-auto pl-2">Reply</span>
            </Button>
          </Col>
        </Row>
      </div>
    </Card>
  );
}

function ForumThread(): JSX.Element {
  const { threadId } = useParams<{ threadId: string }>();
  const { loading, messages, title, handlePaginationChange, total, page, pageSize } = usePaginatedForumThread(
    threadId ?? '',
    initialPageSize,
  );

  const [reply, setReply] = useState(false);

  const handleEnableReply = useCallback(() => {
    setReply(true);
  }, []);

  const handleReplyCancel = useCallback(() => {
    setReply(false);
  }, []);

  const handleReplySubmit = useCallback(() => {
    setReply(false);
  }, []);

  return (
    <Card
      className="flex-1 basis-1"
      fixedheight
      header={<CardHeader title={title} />}
      loading={loading}
      footer={
        <div className="flex justify-end p-4">
          <Pagination
            current={page}
            pageSize={pageSize}
            onChange={handlePaginationChange}
            total={total}
            defaultPageSize={initialPageSize}
            showSizeChanger
            pageSizeOptions={[3, 5, 10, 20]}
          />
        </div>
      }
    >
      <div className="h-full w-full flex flex-col">
        {/* Messages */}
        <div className="flex-1 min-h-0 overflow-hidden mb-4">
          <div className="h-full w-full overflow-y-auto flex flex-col gap-6 py-4">
            {messages.map((msg) => (
              <ForumMessageElement key={msg.id} {...msg} />
            ))}
          </div>
        </div>

        {/* Reply */}
        <div className="relative h-0">
          <Collapse collapse={!reply} className="absolute bottom-0 left-0 w-full">
            <ForumReplyForm onCancel={handleReplyCancel} onSubmit={handleReplySubmit} />
          </Collapse>
        </div>

        <Collapse collapse={reply} forward>
          <FloatButton
            type="primary"
            shape="circle"
            onClick={handleEnableReply}
            icon={<ReplyIcon />}
            style={{ right: 48, bottom: 96 }}
          />
        </Collapse>
      </div>
    </Card>
  );
}

export default ForumThread;
