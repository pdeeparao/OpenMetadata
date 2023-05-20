/*
 *  Copyright 2023 Collate.
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

import { Card, Col, Row, Space, Tabs } from 'antd';
import ActivityFeedList from 'components/ActivityFeed/ActivityFeedList/ActivityFeedList';
import ActivityThreadPanel from 'components/ActivityFeed/ActivityThreadPanel/ActivityThreadPanel';
import Description from 'components/common/description/Description';
import EntityPageInfo from 'components/common/entityPageInfo/EntityPageInfo';
import PageContainerV1 from 'components/containers/PageContainerV1';
import EntityLineageComponent from 'components/EntityLineage/EntityLineage.component';
import Loader from 'components/Loader/Loader';
import { EntityName } from 'components/Modals/EntityNameModal/EntityNameModal.interface';
import SchemaEditor from 'components/schema-editor/SchemaEditor';
import { FQN_SEPARATOR_CHAR } from 'constants/char.constants';
import { getVersionPath } from 'constants/constants';
import { EntityField } from 'constants/Feeds.constants';
import { observerOptions } from 'constants/Mydata.constants';
import { CSMode } from 'enums/codemirror.enum';
import { EntityInfo, EntityType } from 'enums/entity.enum';
import { OwnerType } from 'enums/user.enum';
import { Paging } from 'generated/type/paging';
import { useElementInView } from 'hooks/useElementInView';
import { isUndefined, toString } from 'lodash';
import { ExtraInfo } from 'Models';
import { DATA_MODELS_DETAILS_TABS } from 'pages/DataModelPage/DataModelsInterface';
import React, { RefObject, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import {
  getCountBadge,
  getCurrentUserId,
  getEntityPlaceHolder,
  getOwnerValue,
} from 'utils/CommonUtils';
import { getEntityBreadcrumbs, getEntityName } from 'utils/EntityUtils';
import { getEntityFieldThreadCounts } from 'utils/FeedUtils';
import { getTagsWithoutTier, getTierTags } from 'utils/TableUtils';
import { DataModelDetailsProps } from './DataModelDetails.interface';
import ModelTab from './ModelTab/ModelTab.component';

const DataModelDetails = ({
  isEntityThreadLoading,
  paging,
  entityFieldTaskCount,
  entityFieldThreadCount,
  entityThread,
  feedCount,
  dataModelData,
  dashboardDataModelFQN,
  postFeedHandler,
  dataModelPermissions,
  createThread,
  deletePostHandler,
  updateThreadHandler,
  handleFollowDataModel,
  handleRemoveTier,
  fetchFeedHandler,
  handleUpdateTags,
  handleUpdateOwner,
  handleUpdateTier,
  activeTab,
  handleTabChange,
  handleUpdateDescription,
  handleUpdateDataModel,
  handleFeedFilterChange,
  onUpdateDataModel,
}: DataModelDetailsProps) => {
  const { t } = useTranslation();
  const history = useHistory();
  const [elementRef, isInView] = useElementInView(observerOptions);
  const [isEditDescription, setIsEditDescription] = useState<boolean>(false);
  const [threadLink, setThreadLink] = useState<string>('');

  const loader = useMemo(
    () => (isEntityThreadLoading ? <Loader /> : null),
    [isEntityThreadLoading]
  );

  const {
    hasEditDescriptionPermission,
    hasEditOwnerPermission,
    hasEditTagsPermission,
    hasEditTierPermission,
    hasEditLineagePermission,
  } = useMemo(() => {
    return {
      hasEditDescriptionPermission:
        dataModelPermissions.EditAll || dataModelPermissions.EditDescription,
      hasEditOwnerPermission:
        dataModelPermissions.EditAll || dataModelPermissions.EditOwner,
      hasEditTagsPermission:
        dataModelPermissions.EditAll || dataModelPermissions.EditTags,
      hasEditTierPermission:
        dataModelPermissions.EditAll || dataModelPermissions.EditTier,
      hasEditLineagePermission:
        dataModelPermissions.EditAll || dataModelPermissions.EditLineage,
    };
  }, [dataModelPermissions]);

  const {
    tier,
    deleted,
    owner,
    description,
    version,
    tags,
    entityName,
    entityId,
    followers,
    dataModelType,
    isUserFollowing,
    serviceType,
  } = useMemo(() => {
    return {
      deleted: dataModelData?.deleted,
      owner: dataModelData?.owner,
      description: dataModelData?.description,
      version: dataModelData?.version,
      tier: getTierTags(dataModelData?.tags ?? []),
      tags: getTagsWithoutTier(dataModelData?.tags ?? []),
      entityId: dataModelData?.id,
      entityName: getEntityName(dataModelData),
      isUserFollowing: dataModelData?.followers?.some(
        ({ id }: { id: string }) => id === getCurrentUserId()
      ),
      followers: dataModelData?.followers ?? [],
      dataModelType: dataModelData?.dataModelType,
      serviceType: dataModelData?.serviceType,
    };
  }, [dataModelData]);

  const breadcrumbTitles = useMemo(
    () =>
      dataModelData
        ? getEntityBreadcrumbs(dataModelData, EntityType.DASHBOARD_DATA_MODEL)
        : [],
    [dataModelData]
  );

  const extraInfo: Array<ExtraInfo> = [
    {
      key: EntityInfo.OWNER,
      value: owner && getOwnerValue(owner),
      placeholderText: getEntityPlaceHolder(
        getEntityName(owner),
        owner?.deleted
      ),
      isLink: true,
      openInNewTab: false,
      profileName: owner?.type === OwnerType.USER ? owner?.name : undefined,
    },
    {
      key: EntityInfo.TIER,
      value: tier?.tagFQN ? tier.tagFQN.split(FQN_SEPARATOR_CHAR)[1] : '',
    },
    {
      key: EntityInfo.DATA_MODEL_TYPE,
      value: dataModelType,
      showLabel: true,
    },
  ];

  const handleUpdateDisplayName = async (data: EntityName) => {
    if (isUndefined(dataModelData)) {
      return;
    }

    const updatedData = {
      ...dataModelData,
      displayName: data.displayName,
    };

    await onUpdateDataModel(updatedData, 'displayName');
  };

  const versionHandler = () => {
    history.push(
      getVersionPath(
        EntityType.DASHBOARD_DATA_MODEL,
        dashboardDataModelFQN,
        toString(version)
      )
    );
  };

  const onThreadLinkSelect = (link: string) => {
    setThreadLink(link);
  };

  const onThreadPanelClose = () => {
    setThreadLink('');
  };

  const fetchMoreThread = (
    isElementInView: boolean,
    pagingObj: Paging,
    isLoading: boolean
  ) => {
    if (
      isElementInView &&
      pagingObj?.after &&
      !isLoading &&
      activeTab === DATA_MODELS_DETAILS_TABS.ACTIVITY
    ) {
      fetchFeedHandler(pagingObj.after);
    }
  };

  useEffect(() => {
    fetchMoreThread(isInView, paging, isEntityThreadLoading);
  }, [paging, isEntityThreadLoading, isInView]);

  return (
    <PageContainerV1>
      <div className="entity-details-container">
        <EntityPageInfo
          canDelete={dataModelPermissions.Delete}
          currentOwner={owner}
          deleted={deleted}
          displayName={dataModelData?.displayName}
          entityFieldTasks={getEntityFieldThreadCounts(
            EntityField.TAGS,
            entityFieldTaskCount
          )}
          entityFieldThreads={getEntityFieldThreadCounts(
            EntityField.TAGS,
            entityFieldThreadCount
          )}
          entityFqn={dashboardDataModelFQN}
          entityId={entityId}
          entityName={dataModelData?.name ?? ''}
          entityType={EntityType.DASHBOARD_DATA_MODEL}
          extraInfo={extraInfo}
          followHandler={handleFollowDataModel}
          followers={followers.length}
          followersList={followers}
          isFollowing={isUserFollowing}
          permission={dataModelPermissions}
          removeTier={hasEditTierPermission ? handleRemoveTier : undefined}
          serviceType={serviceType ?? ''}
          tags={tags}
          tagsHandler={handleUpdateTags}
          tier={tier}
          titleLinks={breadcrumbTitles}
          updateOwner={hasEditOwnerPermission ? handleUpdateOwner : undefined}
          updateTier={hasEditTierPermission ? handleUpdateTier : undefined}
          version={version}
          versionHandler={versionHandler}
          onThreadLinkSelect={onThreadLinkSelect}
          onUpdateDisplayName={handleUpdateDisplayName}
        />
        <Tabs
          activeKey={activeTab}
          className="h-full"
          onChange={handleTabChange}>
          <Tabs.TabPane
            key={DATA_MODELS_DETAILS_TABS.MODEL}
            tab={
              <span data-testid={DATA_MODELS_DETAILS_TABS.MODEL}>
                {t('label.model')}
              </span>
            }>
            <Card className="h-full">
              <Space className="w-full" direction="vertical" size={8}>
                <Description
                  description={description}
                  entityFieldTasks={getEntityFieldThreadCounts(
                    EntityField.DESCRIPTION,
                    entityFieldTaskCount
                  )}
                  entityFieldThreads={getEntityFieldThreadCounts(
                    EntityField.DESCRIPTION,
                    entityFieldThreadCount
                  )}
                  entityFqn={dashboardDataModelFQN}
                  entityName={entityName}
                  entityType={EntityType.DASHBOARD_DATA_MODEL}
                  hasEditAccess={hasEditDescriptionPermission}
                  isEdit={isEditDescription}
                  isReadOnly={deleted}
                  owner={owner}
                  onCancel={() => setIsEditDescription(false)}
                  onDescriptionEdit={() => setIsEditDescription(true)}
                  onDescriptionUpdate={handleUpdateDescription}
                  onThreadLinkSelect={onThreadLinkSelect}
                />

                <ModelTab
                  data={dataModelData?.columns || []}
                  hasEditDescriptionPermission={hasEditDescriptionPermission}
                  hasEditTagsPermission={hasEditTagsPermission}
                  isReadOnly={Boolean(deleted)}
                  onUpdate={handleUpdateDataModel}
                />
              </Space>
            </Card>
          </Tabs.TabPane>

          <Tabs.TabPane
            key={DATA_MODELS_DETAILS_TABS.ACTIVITY}
            tab={
              <span data-testid={DATA_MODELS_DETAILS_TABS.ACTIVITY}>
                {t('label.activity-feed-and-task-plural')}{' '}
                {getCountBadge(
                  feedCount,
                  '',
                  DATA_MODELS_DETAILS_TABS.ACTIVITY === activeTab
                )}
              </span>
            }>
            <Card className="h-min-full">
              <Row>
                <Col data-testid="activityfeed" offset={3} span={18}>
                  <ActivityFeedList
                    isEntityFeed
                    withSidePanel
                    deletePostHandler={deletePostHandler}
                    entityName={entityName}
                    feedList={entityThread}
                    isFeedLoading={isEntityThreadLoading}
                    postFeedHandler={postFeedHandler}
                    updateThreadHandler={updateThreadHandler}
                    onFeedFiltersUpdate={handleFeedFilterChange}
                  />
                </Col>
              </Row>
              {loader}
            </Card>
          </Tabs.TabPane>
          {dataModelData?.sql && (
            <Tabs.TabPane
              key={DATA_MODELS_DETAILS_TABS.SQL}
              tab={
                <span data-testid={DATA_MODELS_DETAILS_TABS.SQL}>
                  {t('label.sql-uppercase')}
                </span>
              }>
              <Card className="h-full">
                <SchemaEditor
                  editorClass="custom-code-mirror-theme full-screen-editor-height"
                  mode={{ name: CSMode.SQL }}
                  options={{
                    styleActiveLine: false,
                    readOnly: 'nocursor',
                  }}
                  value={dataModelData.sql}
                />
              </Card>
            </Tabs.TabPane>
          )}

          <Tabs.TabPane
            key={DATA_MODELS_DETAILS_TABS.LINEAGE}
            tab={
              <span data-testid={DATA_MODELS_DETAILS_TABS.LINEAGE}>
                {t('label.lineage')}
              </span>
            }>
            <Card
              className="h-full card-body-full"
              data-testid="lineage-details">
              <EntityLineageComponent
                deleted={deleted}
                entityType={EntityType.DASHBOARD_DATA_MODEL}
                hasEditAccess={hasEditLineagePermission}
              />
            </Card>
          </Tabs.TabPane>
        </Tabs>

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

        <div
          data-testid="observer-element"
          id="observer-element"
          ref={elementRef as RefObject<HTMLDivElement>}
        />
      </div>
    </PageContainerV1>
  );
};

export default DataModelDetails;
