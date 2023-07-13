import { useCallback, useEffect, useRef, useState } from 'react';

import { APIHookError, APIResponse, PaginationResult } from './types';

import { resolveWithTimeout } from 'utils/mock';
import { unitToMs } from 'utils/time';

import { faker } from '@faker-js/faker';
import userImage from 'assets/images/users/user.png';

/* Typing */

export type SimpleUserInfo = {
  id: string;
  name: string;
  image: string;
};

export type ForumThreadSummary = {
  id: string;
  title: string;
  created: string;
  author: SimpleUserInfo;
  repliesCount: number;
  viewsCount: number;
};

export type ForumMessage = {
  id: string;
  threadId: string;
  author: SimpleUserInfo;
  content: string;
  created: string;
};

export type ForumThread = {
  title: string;
  messages: ForumMessage[];
};

/* Utility Functions */

const generateMockSimpleUserInfo = (): SimpleUserInfo => ({
  id: faker.string.uuid(),
  image: userImage,
  name: faker.person.fullName(),
});

const generateMockForumThreadSummary = (): ForumThreadSummary => {
  const repliesCount = Math.floor(Math.random() * 50);
  const viewsCount = Math.floor(repliesCount * (1 + Math.random()));
  return {
    id: faker.string.uuid(),
    title: faker.helpers.arrayElement([
      'Show us your EV!',
      'HEVRA - EV-friendly garage',
      'EV rental in Munich',
      "Offtopic - What's the best university in Munich?",
      'Climate Change Committee - Better transparency is no substitute for real delivery',
      // TODO! add some more funny stuff here.
    ]),
    author: generateMockSimpleUserInfo(),
    created: new Date(Date.now() - Math.floor(Math.random() * 7 * unitToMs('days'))).toISOString(),
    repliesCount,
    viewsCount,
  };
};

const generateMockForumThreadSummaries = (n: number) =>
  faker.helpers.multiple(generateMockForumThreadSummary, { count: n });

const generateMockThreadFromSummary = (summary: ForumThreadSummary): ForumThread => {
  // Generate participants:
  const nParticipants = Math.floor(Math.random() * summary.repliesCount * 0.6);
  const participants = [
    summary.author,
    ...faker.helpers.multiple(generateMockSimpleUserInfo, { count: nParticipants }),
  ];

  const threadStartTimestamp = new Date(summary.created).getTime();
  const timeSinceThreadCreation = Date.now() - threadStartTimestamp;

  const messages: ForumMessage[] = [
    {
      id: faker.string.uuid(),
      threadId: summary.id,
      author: summary.author,
      content: faker.lorem.paragraphs({ min: 1, max: 3 }),
      created: summary.created,
    },
    // Generate replies, randomly space in time, between creation and now
    ...new Array(summary.repliesCount).fill(0).map(
      (): ForumMessage => ({
        id: faker.string.uuid(),
        threadId: summary.id,
        author: participants[Math.floor(Math.random() * participants.length)],
        content: faker.lorem.paragraphs({ min: 1, max: 3 }),
        created: new Date(Math.floor(Math.random() * timeSinceThreadCreation) + threadStartTimestamp).toISOString(),
      }),
    ),
  ];

  return {
    title: summary.title,
    messages,
  };
};

/* Database */

const threadSummaries = generateMockForumThreadSummaries(30);
const threads = threadSummaries
  .map((summary) => {
    return {
      summary,
      messages: generateMockThreadFromSummary(summary),
    };
  })
  .reduce((database, { summary, messages }) => {
    database[summary.id] = messages;
    return database;
  }, {} as Record<string, ForumThread>);

/* API-Calls */

export const getPaginatedForumThreadSummaries = async (
  offset: number,
  count: number,
): Promise<APIResponse<PaginationResult<ForumThreadSummary>>> => {
  const totalCount = threadSummaries.length;
  const safeCount = Math.min(count, totalCount - offset);

  // Return after timeout
  return resolveWithTimeout({
    status: 200,
    data: {
      count,
      offset,
      totalCount,
      elements: threadSummaries.slice(offset, offset + safeCount),
    },
  });
};

export const getPaginatedMessagesForThread = async (
  threadId: string,
  offset: number,
  count: number,
): Promise<APIResponse<PaginationResult<ForumMessage> & { title: string }>> => {
  const thread = threads[threadId] ?? generateMockThreadFromSummary(threadSummaries[0]);

  const totalCount = thread.messages.length;
  const safeCount = Math.min(count, totalCount - offset);

  console.log(totalCount, offset, safeCount);

  // Return after timeout
  return resolveWithTimeout({
    status: 200,
    data: {
      count,
      offset,
      totalCount,
      elements: thread.messages.slice(offset, offset + safeCount),
      title: thread.title,
    },
  });
};

/* Hooks */

export const usePaginatedForumOverview = (initialPageSize = 10) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<APIHookError | null>(null);
  const [summaries, setSummaries] = useState<ForumThreadSummary[]>([]);

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [total, setTotal] = useState(0);

  // Used to check if the pageSize has changed
  const lastPaginationConfigRef = useRef({
    page: 0,
    pageSize: initialPageSize,
  });

  const isMountedRef = useRef(false);

  const update = useCallback(() => {
    // TODO this is very generic, so we could make this a wrapper thingie
    setLoading(true);
    getPaginatedForumThreadSummaries((page - 1) * pageSize, pageSize).then((val) => {
      if (!isMountedRef.current) return;
      setLoading(false);
      if (val.status !== 200) {
        setError(APIHookError.InvalidRequestError);
        setSummaries([]);
        setTotal(0);
        return;
      }
      if (val.data == null) {
        setError(APIHookError.ServerSideError);
        setSummaries([]);
        setTotal(0);
        return;
      }
      setError(null);
      setSummaries(val.data.elements);
      setTotal(val.data.totalCount);
    });
  }, [page, pageSize]);

  // Compatible with the call-sig of antd Pagination component
  const handlePaginationChange = useCallback((page: number, pageSize: number) => {
    const pageSizeChanged = lastPaginationConfigRef.current.pageSize !== pageSize;
    if (pageSizeChanged) {
      // TODO! We need to ensure that the currently visible items are still visible
      // for now we just reset the page.
      setPage(1);
      setPageSize(pageSize);
      lastPaginationConfigRef.current = { page: 1, pageSize };
      return;
    }

    setPage(page);
    lastPaginationConfigRef.current = { page, pageSize };
  }, []);

  useEffect(() => {
    isMountedRef.current = true;

    // Update on mount
    update();

    return () => {
      isMountedRef.current = false;
    };
  }, [update]);

  return {
    loading,
    error,
    summaries,
    total,
    handlePaginationChange,
  };
};

export const usePaginatedForumThread = (threadId: string, initialPageSize = 10) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<APIHookError | null>(null);
  const [messages, setMessages] = useState<ForumMessage[]>([]);
  const [title, setTitle] = useState<string | undefined>(undefined);

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [total, setTotal] = useState(0);

  // Used to check if the pageSize has changed
  const lastPaginationConfigRef = useRef({
    page: 0,
    pageSize: initialPageSize,
  });

  const isMountedRef = useRef(false);

  const update = useCallback(() => {
    // TODO this is very generic, so we could make this a wrapper thingie
    setLoading(true);
    getPaginatedMessagesForThread(threadId, (page - 1) * pageSize, pageSize).then((val) => {
      if (!isMountedRef.current) return;
      setLoading(false);
      if (val.status !== 200) {
        setError(APIHookError.InvalidRequestError);
        setMessages([]);
        setTitle(undefined);
        setTotal(0);
        return;
      }
      if (val.data == null) {
        setError(APIHookError.ServerSideError);
        setMessages([]);
        setTitle(undefined);
        setTotal(0);
        return;
      }
      setError(null);
      setMessages(val.data.elements);
      setTitle(val.data.title);
      setTotal(val.data.totalCount);
    });
  }, [threadId, page, pageSize]);

  // Compatible with the call-sig of antd Pagination component
  const handlePaginationChange = useCallback((page: number, pageSize: number) => {
    const pageSizeChanged = lastPaginationConfigRef.current.pageSize !== pageSize;
    console.log(page, pageSize);
    if (pageSizeChanged) {
      // TODO! We need to ensure that the currently visible items are still visible
      // for now we just reset the page.
      setPage(1);
      setPageSize(pageSize);
      lastPaginationConfigRef.current = { page: 1, pageSize };
      return;
    }

    setPage(page);
    lastPaginationConfigRef.current = { page, pageSize };
  }, []);

  useEffect(() => {
    isMountedRef.current = true;

    // Update on mount
    update();

    return () => {
      isMountedRef.current = false;
    };
  }, [update]);

  return {
    loading,
    error,
    messages,
    title,
    total,
    page,
    pageSize,
    handlePaginationChange,
  };
};
