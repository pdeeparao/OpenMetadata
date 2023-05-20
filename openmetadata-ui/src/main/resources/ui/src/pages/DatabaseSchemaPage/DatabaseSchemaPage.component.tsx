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

import {
  Card,
  Col,
  Row,
  Skeleton,
  Switch,
  Table as TableAntd,
  Typography,
} from 'antd';
import { ItemType } from 'antd/lib/menu/hooks/useItems';
import { ColumnsType } from 'antd/lib/table';
import { AxiosError } from 'axios';
import ActivityFeedList from 'components/ActivityFeed/ActivityFeedList/ActivityFeedList';
import ActivityThreadPanel from 'components/ActivityFeed/ActivityThreadPanel/ActivityThreadPanel';
import Description from 'components/common/description/Description';
import EntityPageInfo from 'components/common/entityPageInfo/EntityPageInfo';
import ErrorPlaceHolder from 'components/common/error-with-placeholder/ErrorPlaceHolder';
import FilterTablePlaceHolder from 'components/common/error-with-placeholder/FilterTablePlaceHolder';
import NextPrevious from 'components/common/next-previous/NextPrevious';
import RichTextEditorPreviewer from 'components/common/rich-text-editor/RichTextEditorPreviewer';
import TabsPane from 'components/common/TabsPane/TabsPane';
import { TitleBreadcrumbProps } from 'components/common/title-breadcrumb/title-breadcrumb.interface';
import PageContainerV1 from 'components/containers/PageContainerV1';
import PageLayoutV1 from 'components/containers/PageLayoutV1';
import Loader from 'components/Loader/Loader';
import { EntityName } from 'components/Modals/EntityNameModal/EntityNameModal.interface';
import { usePermissionProvider } from 'components/PermissionProvider/PermissionProvider';
import {
  OperationPermission,
  ResourceEntity,
} from 'components/PermissionProvider/PermissionProvider.interface';
import { DROPDOWN_ICON_SIZE_PROPS } from 'constants/ManageButton.constants';
import { ERROR_PLACEHOLDER_TYPE } from 'enums/common.enum';
import { compare, Operation } from 'fast-json-patch';
import { TagLabel } from 'generated/type/tagLabel';
import { isEmpty, isUndefined, startCase, toNumber } from 'lodash';
import { observer } from 'mobx-react';
import { EntityTags, ExtraInfo } from 'Models';
import React, {
  Fragment,
  FunctionComponent,
  RefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useHistory, useParams } from 'react-router-dom';
import {
  getDatabaseSchemaDetailsByFQN,
  patchDatabaseSchemaDetails,
  restoreDatabaseSchema,
} from 'rest/databaseAPI';
import {
  getAllFeeds,
  getFeedCount,
  postFeedById,
  postThread,
} from 'rest/feedsAPI';
import { searchQuery } from 'rest/searchAPI';
import { default as AppState, default as appState } from '../../AppState';
import { ReactComponent as IconShowPassword } from '../../assets/svg/show-password.svg';
import { FQN_SEPARATOR_CHAR } from '../../constants/char.constants';
import {
  getDatabaseDetailsPath,
  getDatabaseSchemaDetailsPath,
  getServiceDetailsPath,
  getTeamAndUserDetailsPath,
  INITIAL_PAGING_VALUE,
  PAGE_SIZE,
} from '../../constants/constants';
import { EntityField } from '../../constants/Feeds.constants';
import { GlobalSettingsMenuCategory } from '../../constants/GlobalSettings.constants';
import { observerOptions } from '../../constants/Mydata.constants';
import { EntityType, TabSpecificField } from '../../enums/entity.enum';
import { SearchIndex } from '../../enums/search.enum';
import { ServiceCategory } from '../../enums/service.enum';
import { OwnerType } from '../../enums/user.enum';
import { CreateThread } from '../../generated/api/feed/createThread';
import { DatabaseSchema } from '../../generated/entity/data/databaseSchema';
import { Table } from '../../generated/entity/data/table';
import { Post, Thread } from '../../generated/entity/feed/thread';
import { Paging } from '../../generated/type/paging';
import { useElementInView } from '../../hooks/useElementInView';
import { EntityFieldThreadCount } from '../../interface/feed.interface';
import {
  databaseSchemaDetailsTabs,
  getCurrentDatabaseSchemaDetailsTab,
  getQueryStringForSchemaTables,
  getTablesFromSearchResponse,
} from '../../utils/DatabaseSchemaDetailsUtils';
import { getEntityFeedLink, getEntityName } from '../../utils/EntityUtils';
import {
  deletePost,
  getEntityFieldThreadCounts,
  updateThreadData,
} from '../../utils/FeedUtils';
import { DEFAULT_ENTITY_PERMISSION } from '../../utils/PermissionsUtils';
import { getSettingPath } from '../../utils/RouterUtils';
import { getServiceRouteFromServiceType } from '../../utils/ServiceUtils';
import { getErrorText } from '../../utils/StringsUtils';
import {
  getEntityLink,
  getTagsWithoutTier,
  getTierTags,
} from '../../utils/TableUtils';
import { showErrorToast, showSuccessToast } from '../../utils/ToastUtils';

const DatabaseSchemaPage: FunctionComponent = () => {
  const [slashedTableName, setSlashedTableName] = useState<
    TitleBreadcrumbProps['titleLinks']
  >([]);
  const { t } = useTranslation();
  const { getEntityPermissionByFqn } = usePermissionProvider();

  const { databaseSchemaFQN, tab } = useParams<Record<string, string>>();
  const [isLoading, setIsLoading] = useState(true);
  const [databaseSchema, setDatabaseSchema] = useState<DatabaseSchema>();
  const [tableData, setTableData] = useState<Array<Table>>([]);
  const [tableDataLoading, setTableDataLoading] = useState<boolean>(true);

  const [databaseSchemaName, setDatabaseSchemaName] = useState<string>(
    databaseSchemaFQN.split(FQN_SEPARATOR_CHAR).slice(-1).pop() || ''
  );
  const [IsSchemaDetailsLoading, setIsSchemaDetailsLoading] =
    useState<boolean>(true);
  const [isEdit, setIsEdit] = useState(false);
  const [description, setDescription] = useState('');

  const [tableInstanceCount, setTableInstanceCount] = useState<number>(0);

  const [activeTab, setActiveTab] = useState<number>(
    getCurrentDatabaseSchemaDetailsTab(tab)
  );
  const [error, setError] = useState('');

  const [entityThread, setEntityThread] = useState<Thread[]>([]);
  const [isentityThreadLoading, setIsentityThreadLoading] =
    useState<boolean>(false);
  const [feedCount, setFeedCount] = useState<number>(0);
  const [entityFieldThreadCount, setEntityFieldThreadCount] = useState<
    EntityFieldThreadCount[]
  >([]);

  const [threadLink, setThreadLink] = useState<string>('');
  const [paging, setPaging] = useState<Paging>({} as Paging);
  const [currentTablesPage, setCurrentTablesPage] =
    useState<number>(INITIAL_PAGING_VALUE);
  const [elementRef, isInView] = useElementInView(observerOptions);

  const history = useHistory();
  const isMounting = useRef(true);

  const [databaseSchemaPermission, setDatabaseSchemaPermission] =
    useState<OperationPermission>(DEFAULT_ENTITY_PERMISSION);

  const [tags, setTags] = useState<Array<EntityTags>>([]);
  const [tier, setTier] = useState<TagLabel>();

  const [showDeletedTables, setShowDeletedTables] = useState<boolean>(false);

  const databaseSchemaId = useMemo(
    () => databaseSchema?.id ?? '',
    [databaseSchema]
  );

  const fetchDatabaseSchemaPermission = async () => {
    setIsLoading(true);
    try {
      const response = await getEntityPermissionByFqn(
        ResourceEntity.DATABASE_SCHEMA,
        databaseSchemaFQN
      );
      setDatabaseSchemaPermission(response);
    } catch (error) {
      showErrorToast(error as AxiosError);
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    {
      name: 'Tables',
      icon: {
        alt: 'tables',
        name: 'table-grey',
        title: 'Tables',
        selectedName: 'table',
      },
      count: tableInstanceCount,
      isProtected: false,
      position: 1,
    },
    {
      name: 'Activity Feeds',
      icon: {
        alt: 'activity_feed',
        name: 'activity_feed',
        title: 'Activity Feed',
        selectedName: 'activity-feed-color',
      },
      isProtected: false,
      position: 2,
      count: feedCount,
    },
  ];

  const extraInfo: Array<ExtraInfo> = [
    {
      key: 'Owner',
      value:
        databaseSchema?.owner?.type === 'team'
          ? getTeamAndUserDetailsPath(
              databaseSchema?.owner?.displayName ||
                databaseSchema?.owner?.name ||
                ''
            )
          : databaseSchema?.owner?.displayName ||
            databaseSchema?.owner?.name ||
            '',
      placeholderText:
        databaseSchema?.owner?.displayName || databaseSchema?.owner?.name || '',
      isLink: databaseSchema?.owner?.type === 'team',
      openInNewTab: false,
      profileName:
        databaseSchema?.owner?.type === OwnerType.USER
          ? databaseSchema?.owner?.name
          : undefined,
    },
  ];

  const onThreadLinkSelect = (link: string) => {
    setThreadLink(link);
  };

  const onThreadPanelClose = () => {
    setThreadLink('');
  };

  const getEntityFeedCount = () => {
    getFeedCount(
      getEntityFeedLink(EntityType.DATABASE_SCHEMA, databaseSchemaFQN)
    )
      .then((res) => {
        if (res) {
          setFeedCount(res.totalCount);
          setEntityFieldThreadCount(res.counts);
        } else {
          throw t('server.unexpected-response');
        }
      })
      .catch((err: AxiosError) => {
        showErrorToast(err, t('server.entity-feed-fetch-error'));
      });
  };

  const getDetailsByFQN = () => {
    setIsSchemaDetailsLoading(true);
    getDatabaseSchemaDetailsByFQN(
      databaseSchemaFQN,
      ['owner', 'usageSummary', 'tags'],
      'include=all'
    )
      .then((res) => {
        if (res) {
          const {
            description: schemaDescription = '',
            name,
            service,
            database,
            tags,
          } = res;
          setDatabaseSchema(res);
          setDescription(schemaDescription);

          setDatabaseSchemaName(name);
          setTags(getTagsWithoutTier(tags || []));
          setTier(getTierTags(tags ?? []));
          setShowDeletedTables(res.deleted ?? false);
          setSlashedTableName([
            {
              name: startCase(ServiceCategory.DATABASE_SERVICES),
              url: getSettingPath(
                GlobalSettingsMenuCategory.SERVICES,
                getServiceRouteFromServiceType(
                  ServiceCategory.DATABASE_SERVICES
                )
              ),
            },
            {
              name: getEntityName(service),
              url: service.name
                ? getServiceDetailsPath(
                    service.name,
                    ServiceCategory.DATABASE_SERVICES
                  )
                : '',
            },
            {
              name: getEntityName(database),
              url: getDatabaseDetailsPath(database.fullyQualifiedName ?? ''),
            },
          ]);
        } else {
          throw t('server.unexpected-response');
        }
      })
      .catch((err: AxiosError) => {
        const errMsg = getErrorText(
          err,
          t('server.entity-fetch-error', {
            entity: t('label.database-schema'),
          })
        );

        setError(errMsg);
        showErrorToast(errMsg);
      })
      .finally(() => {
        setIsLoading(false);
        setIsSchemaDetailsLoading(false);
      });
  };

  const getSchemaTables = async (
    pageNumber: number,
    databaseSchema: DatabaseSchema
  ) => {
    setTableDataLoading(true);
    try {
      setCurrentTablesPage(pageNumber);
      const res = await searchQuery({
        query: getQueryStringForSchemaTables(
          databaseSchema.service,
          databaseSchema.database,
          databaseSchema
        ),
        pageNumber,
        sortField: 'name.keyword',
        sortOrder: 'asc',
        pageSize: PAGE_SIZE,
        searchIndex: SearchIndex.TABLE,
        includeDeleted: showDeletedTables,
      });
      setTableData(getTablesFromSearchResponse(res));
      setTableInstanceCount(res.hits.total.value);
    } catch (err) {
      showErrorToast(err as AxiosError);
    } finally {
      setTableDataLoading(false);
    }
  };

  const tablePaginationHandler = (pageNumber: string | number) => {
    if (!isUndefined(databaseSchema)) {
      getSchemaTables(toNumber(pageNumber), databaseSchema);
    }
  };

  const onCancel = () => {
    setIsEdit(false);
  };

  const saveUpdatedDatabaseSchemaData = useCallback(
    async (updatedData: DatabaseSchema): Promise<DatabaseSchema> => {
      let jsonPatch: Operation[] = [];
      if (databaseSchema) {
        jsonPatch = compare(databaseSchema, updatedData);
      }

      return patchDatabaseSchemaDetails(databaseSchemaId, jsonPatch);
    },
    [databaseSchemaId, databaseSchema]
  );

  const onDescriptionUpdate = async (updatedHTML: string) => {
    if (description !== updatedHTML && databaseSchema) {
      const updatedDatabaseSchemaDetails = {
        ...databaseSchema,
        description: updatedHTML,
      };

      try {
        const response = await saveUpdatedDatabaseSchemaData(
          updatedDatabaseSchemaDetails
        );
        if (response) {
          setDatabaseSchema(updatedDatabaseSchemaDetails);
          setDescription(updatedHTML);
          getEntityFeedCount();
        } else {
          throw t('server.unexpected-response');
        }
      } catch (error) {
        showErrorToast(error as AxiosError);
      } finally {
        setIsEdit(false);
      }
    } else {
      setIsEdit(false);
    }
  };

  const onDescriptionEdit = (): void => {
    setIsEdit(true);
  };

  const activeTabHandler = (tabValue: number) => {
    const currentTabIndex = tabValue - 1;
    if (databaseSchemaDetailsTabs[currentTabIndex].path !== tab) {
      setActiveTab(tabValue);
      history.push({
        pathname: getDatabaseSchemaDetailsPath(
          databaseSchemaFQN,
          databaseSchemaDetailsTabs[currentTabIndex].path
        ),
      });
    }
  };

  const handleUpdateOwner = useCallback(
    (owner: DatabaseSchema['owner']) => {
      const updatedData = {
        ...databaseSchema,
        owner: owner ? { ...databaseSchema?.owner, ...owner } : undefined,
      };

      return new Promise<void>((_, reject) => {
        saveUpdatedDatabaseSchemaData(updatedData as DatabaseSchema)
          .then((res) => {
            if (res) {
              setDatabaseSchema(res);
              reject();
            } else {
              reject();

              throw t('server.unexpected-response');
            }
          })
          .catch((err: AxiosError) => {
            showErrorToast(
              err,
              t('server.entity-updating-error', {
                entity: t('label.database-schema'),
              })
            );
            reject();
          });
      });
    },
    [databaseSchema, databaseSchema?.owner]
  );

  const onTagUpdate = async (selectedTags?: Array<EntityTags>) => {
    if (selectedTags) {
      const updatedTags = [...(tier ? [tier] : []), ...selectedTags];
      const updatedData = { ...databaseSchema, tags: updatedTags };

      try {
        const res = await saveUpdatedDatabaseSchemaData(
          updatedData as DatabaseSchema
        );
        setDatabaseSchema(res);
        setTags(getTagsWithoutTier(res.tags || []));
        setTier(getTierTags(res.tags ?? []));
        getEntityFeedCount();
      } catch (error) {
        showErrorToast(error as AxiosError, t('server.api-error'));
      }
    }
  };

  const handleUpdateDisplayName = async (data: EntityName) => {
    if (isUndefined(databaseSchema)) {
      return;
    }
    const updatedData = { ...databaseSchema, displayName: data.displayName };

    try {
      const res = await saveUpdatedDatabaseSchemaData(updatedData);
      setDatabaseSchema(res);
      getEntityFeedCount();
    } catch (error) {
      showErrorToast(error as AxiosError, t('server.api-error'));
    }
  };

  const fetchActivityFeed = (after?: string) => {
    setIsentityThreadLoading(true);
    getAllFeeds(
      getEntityFeedLink(EntityType.DATABASE_SCHEMA, databaseSchemaFQN),
      after
    )
      .then((res) => {
        const { data, paging: pagingObj } = res;
        if (data) {
          setPaging(pagingObj);
          setEntityThread((prevData) => [...prevData, ...data]);
        } else {
          throw t('server.unexpected-response');
        }
      })
      .catch((err: AxiosError) => {
        showErrorToast(
          err,
          t('server.entity-fetch-error', {
            entity: t('label.feed-plural'),
          })
        );
      })
      .finally(() => setIsentityThreadLoading(false));
  };

  const postFeedHandler = (value: string, id: string) => {
    const currentUser = AppState.userDetails?.name ?? AppState.users[0]?.name;

    const data = {
      message: value,
      from: currentUser,
    } as Post;
    postFeedById(id, data)
      .then((res) => {
        if (res) {
          const { id: threadId, posts } = res;
          setEntityThread((pre) => {
            return pre.map((thread) => {
              if (thread.id === threadId) {
                return { ...res, posts: posts?.slice(-3) };
              } else {
                return thread;
              }
            });
          });
          getEntityFeedCount();
        } else {
          throw t('server.unexpected-response');
        }
      })
      .catch((err: AxiosError) => {
        showErrorToast(
          err,
          t('server.add-entity-error', {
            entity: t('label.feed'),
          })
        );
      });
  };

  const createThread = (data: CreateThread) => {
    postThread(data)
      .then((res) => {
        if (res) {
          setEntityThread((pre) => [...pre, res]);
          getEntityFeedCount();
        } else {
          showErrorToast(t('server.unexpected-response'));
        }
      })
      .catch((err: AxiosError) => {
        showErrorToast(
          err,
          t('server.create-entity-error', {
            entity: t('label.conversation-lowercase'),
          })
        );
      });
  };

  const deletePostHandler = (
    threadId: string,
    postId: string,
    isThread: boolean
  ) => {
    deletePost(threadId, postId, isThread, setEntityThread);
  };

  const updateThreadHandler = (
    threadId: string,
    postId: string,
    isThread: boolean,
    data: Operation[]
  ) => {
    updateThreadData(threadId, postId, isThread, data, setEntityThread);
  };

  const getLoader = () => {
    return isentityThreadLoading ? <Loader /> : null;
  };

  const fetchMoreFeed = (
    isElementInView: boolean,
    pagingObj: Paging,
    isFeedLoading: boolean
  ) => {
    if (isElementInView && pagingObj?.after && !isFeedLoading) {
      fetchActivityFeed(pagingObj.after);
    }
  };

  const tableColumn: ColumnsType<Table> = useMemo(
    () => [
      {
        title: t('label.table-entity-text', {
          entityText: t('label.name'),
        }),
        dataIndex: 'name',
        key: 'name',
        render: (_, record: Table) => {
          return (
            <Link
              to={getEntityLink(
                EntityType.TABLE,
                record.fullyQualifiedName as string
              )}>
              {getEntityName(record)}
            </Link>
          );
        },
      },
      {
        title: t('label.description'),
        dataIndex: 'description',
        key: 'description',
        render: (text: string) =>
          text?.trim() ? (
            <RichTextEditorPreviewer markdown={text} />
          ) : (
            <span className="text-grey-muted">{t('label.no-description')}</span>
          ),
      },
    ],
    []
  );

  const getSchemaTableList = () => {
    return (
      <Col span={24}>
        {isEmpty(tableData) && !showDeletedTables && !tableDataLoading ? (
          <ErrorPlaceHolder
            className="mt-0-important"
            type={ERROR_PLACEHOLDER_TYPE.NO_DATA}
          />
        ) : (
          <TableAntd
            bordered
            className="table-shadow"
            columns={tableColumn}
            data-testid="databaseSchema-tables"
            dataSource={tableData}
            locale={{
              emptyText: <FilterTablePlaceHolder />,
            }}
            pagination={false}
            rowKey="id"
            size="small"
          />
        )}

        {tableInstanceCount > PAGE_SIZE && tableData.length > 0 && (
          <NextPrevious
            isNumberBased
            currentPage={currentTablesPage}
            pageSize={PAGE_SIZE}
            paging={paging}
            pagingHandler={tablePaginationHandler}
            totalCount={tableInstanceCount}
          />
        )}
      </Col>
    );
  };

  const extraDropdownContent: ItemType[] = useMemo(
    () => [
      {
        label: (
          <Row className="cursor-pointer" data-testid="deleted-table-menu-item">
            <Col span={3}>
              <IconShowPassword {...DROPDOWN_ICON_SIZE_PROPS} />
            </Col>
            <Col span={21}>
              <Row>
                <Col span={21}>
                  <Typography.Text
                    className="font-medium"
                    data-testid="deleted-table-menu-item-label">
                    {t('label.show-deleted-entity', {
                      entity: t('label.table'),
                    })}
                  </Typography.Text>
                </Col>

                <Col span={3}>
                  <Switch
                    checked={showDeletedTables}
                    data-testid="deleted-table-menu-item-switch"
                    size="small"
                    onChange={setShowDeletedTables}
                  />
                </Col>

                <Col className="p-t-xss">
                  <Typography.Paragraph className="text-grey-muted text-xs m-b-0 line-height-16">
                    {t('message.view-deleted-entity', {
                      entity: t('label.table-plural'),
                      parent: t('label.schema'),
                    })}
                  </Typography.Paragraph>
                </Col>
              </Row>
            </Col>
          </Row>
        ),
        key: 'deleted-team-dropdown',
      },
    ],
    [showDeletedTables]
  );

  const handleRestoreDatabaseSchema = useCallback(async () => {
    try {
      await restoreDatabaseSchema(databaseSchemaId);
      showSuccessToast(
        t('message.restore-entities-success', {
          entity: t('label.database-schema'),
        }),
        2000
      );
      getDetailsByFQN();
    } catch (error) {
      showErrorToast(
        error as AxiosError,
        t('message.restore-entities-error', {
          entity: t('label.database-schema'),
        })
      );
    }
  }, [databaseSchemaId]);

  useEffect(() => {
    if (TabSpecificField.ACTIVITY_FEED === tab) {
      fetchActivityFeed();
    } else {
      setEntityThread([]);
    }
  }, [tab]);

  useEffect(() => {
    fetchMoreFeed(isInView, paging, isentityThreadLoading);
  }, [isInView, paging, isentityThreadLoading]);

  useEffect(() => {
    if (
      databaseSchemaPermission.ViewAll ||
      databaseSchemaPermission.ViewBasic
    ) {
      const currentTab = getCurrentDatabaseSchemaDetailsTab(tab);
      const currentTabIndex = currentTab - 1;

      if (tabs[currentTabIndex].isProtected) {
        activeTabHandler(1);
      }
      getDetailsByFQN();
      getEntityFeedCount();
    }
  }, [databaseSchemaPermission, databaseSchemaFQN]);

  useEffect(() => {
    tablePaginationHandler(INITIAL_PAGING_VALUE);
  }, [showDeletedTables, databaseSchema]);

  useEffect(() => {
    fetchDatabaseSchemaPermission();
  }, [databaseSchemaFQN]);

  // always Keep this useEffect at the end...
  useEffect(() => {
    isMounting.current = false;
    appState.inPageSearchText = '';
  }, []);

  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    return (
      <ErrorPlaceHolder>
        <p data-testid="error-message">{error}</p>
      </ErrorPlaceHolder>
    );
  }

  return (
    <Fragment>
      {databaseSchemaPermission.ViewAll ||
      databaseSchemaPermission.ViewBasic ? (
        <PageContainerV1>
          <PageLayoutV1
            pageTitle={t('label.entity-detail-plural', {
              entity: getEntityName(databaseSchema),
            })}>
            {IsSchemaDetailsLoading ? (
              <Skeleton
                active
                paragraph={{
                  rows: 3,
                  width: ['20%', '80%', '60%'],
                }}
              />
            ) : (
              <>
                <Col span={24}>
                  <EntityPageInfo
                    isRecursiveDelete
                    canDelete={databaseSchemaPermission.Delete}
                    currentOwner={databaseSchema?.owner}
                    deleted={databaseSchema?.deleted}
                    displayName={databaseSchema?.displayName}
                    entityFieldThreads={getEntityFieldThreadCounts(
                      EntityField.TAGS,
                      entityFieldThreadCount
                    )}
                    entityFqn={databaseSchemaFQN}
                    entityId={databaseSchemaId}
                    entityName={databaseSchemaName}
                    entityType={EntityType.DATABASE_SCHEMA}
                    extraDropdownContent={extraDropdownContent}
                    extraInfo={extraInfo}
                    followersList={[]}
                    permission={databaseSchemaPermission}
                    serviceType={databaseSchema?.serviceType ?? ''}
                    tags={tags}
                    tagsHandler={onTagUpdate}
                    tier={tier}
                    titleLinks={slashedTableName}
                    updateOwner={
                      databaseSchemaPermission.EditOwner ||
                      databaseSchemaPermission.EditAll
                        ? handleUpdateOwner
                        : undefined
                    }
                    onRestoreEntity={handleRestoreDatabaseSchema}
                    onThreadLinkSelect={onThreadLinkSelect}
                    onUpdateDisplayName={handleUpdateDisplayName}
                  />
                </Col>
              </>
            )}
            <Col span={24}>
              <Row className="m-t-xss">
                <Col span={24}>
                  <TabsPane
                    activeTab={activeTab}
                    className="flex-initial"
                    setActiveTab={activeTabHandler}
                    tabs={tabs}
                  />
                </Col>
                <Col className="p-y-md" span={24}>
                  {activeTab === 1 && (
                    <Card className="h-full">
                      {tableDataLoading ? (
                        <Loader />
                      ) : (
                        <Row gutter={[16, 16]}>
                          <Col data-testid="description-container" span={24}>
                            <Description
                              description={description}
                              entityFieldThreads={getEntityFieldThreadCounts(
                                EntityField.DESCRIPTION,
                                entityFieldThreadCount
                              )}
                              entityFqn={databaseSchemaFQN}
                              entityName={databaseSchemaName}
                              entityType={EntityType.DATABASE_SCHEMA}
                              hasEditAccess={
                                databaseSchemaPermission.EditDescription ||
                                databaseSchemaPermission.EditAll
                              }
                              isEdit={isEdit}
                              onCancel={onCancel}
                              onDescriptionEdit={onDescriptionEdit}
                              onDescriptionUpdate={onDescriptionUpdate}
                              onThreadLinkSelect={onThreadLinkSelect}
                            />
                          </Col>
                          {getSchemaTableList()}
                        </Row>
                      )}
                    </Card>
                  )}
                  {activeTab === 2 && (
                    <Card className="p-t-xss p-b-md">
                      <Row className="entity-feed-list" id="activityfeed">
                        <Col offset={4} span={16}>
                          <ActivityFeedList
                            hideFeedFilter
                            hideThreadFilter
                            isEntityFeed
                            withSidePanel
                            className=""
                            deletePostHandler={deletePostHandler}
                            entityName={databaseSchemaName}
                            feedList={entityThread}
                            postFeedHandler={postFeedHandler}
                            updateThreadHandler={updateThreadHandler}
                          />
                        </Col>
                      </Row>
                    </Card>
                  )}
                  <Col
                    data-testid="observer-element"
                    id="observer-element"
                    ref={elementRef as RefObject<HTMLDivElement>}
                    span={24}>
                    {getLoader()}
                  </Col>
                </Col>
              </Row>
            </Col>
            <Col span={24}>
              {threadLink ? (
                <ActivityThreadPanel
                  createThread={createThread}
                  deletePostHandler={deletePostHandler}
                  open={Boolean(threadLink)}
                  postFeedHandler={postFeedHandler}
                  threadLink={threadLink}
                  updateThreadHandler={updateThreadHandler}
                  onCancel={onThreadPanelClose}
                />
              ) : null}
            </Col>
          </PageLayoutV1>
        </PageContainerV1>
      ) : (
        <ErrorPlaceHolder
          className="mt-24"
          type={ERROR_PLACEHOLDER_TYPE.PERMISSION}
        />
      )}
    </Fragment>
  );
};

export default observer(DatabaseSchemaPage);
