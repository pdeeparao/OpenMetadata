/*
 *  Copyright 2022 Collate.
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *  http://www.apache.org/licenses/LICENSE-2.0
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

import { FeedFilter } from '../../enums/mydata.enum';
import { CreateThread } from '../../generated/api/feed/createThread';
import { CleanupPolicy, Topic } from '../../generated/entity/data/topic';
import { Thread, ThreadType } from '../../generated/entity/feed/thread';
import { Paging } from '../../generated/type/paging';
import { SchemaType } from '../../generated/type/schema';
import {
  EntityFieldThreadCount,
  ThreadUpdatedFunc,
} from '../../interface/feed.interface';

export interface TopicDetailsProps {
  topicFQN: string;
  topicDetails: Topic;
  activeTab: number;
  entityThread: Thread[];
  isEntityThreadLoading: boolean;
  feedCount: number;
  entityFieldThreadCount: EntityFieldThreadCount[];
  entityFieldTaskCount: EntityFieldThreadCount[];
  paging: Paging;

  fetchFeedHandler: (
    after?: string,
    feedFilter?: FeedFilter,
    threadFilter?: ThreadType
  ) => void;
  createThread: (data: CreateThread) => void;
  setActiveTabHandler: (value: number) => void;
  followTopicHandler: () => void;
  unfollowTopicHandler: () => void;
  versionHandler: () => void;
  postFeedHandler: (value: string, id: string) => void;
  deletePostHandler: (
    threadId: string,
    postId: string,
    isThread: boolean
  ) => void;
  updateThreadHandler: ThreadUpdatedFunc;
  onTopicUpdate: (updatedData: Topic, key: keyof Topic) => Promise<void>;
}

export interface TopicConfigObjectInterface {
  Owner?: Record<string, string | JSX.Element | undefined>;
  Partitions: number;
  'Replication Factor'?: number;
  'Retention Size'?: number;
  'CleanUp Policies'?: CleanupPolicy[];
  'Max Message Size'?: number;
  'Schema Type'?: SchemaType;
}
