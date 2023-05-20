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
import { Button, Popover, Space, Typography } from 'antd';
import Table, { ColumnsType } from 'antd/lib/table';
import RichTextEditorPreviewer from 'components/common/rich-text-editor/RichTextEditorPreviewer';
import { Column, TagLabel } from 'generated/entity/data/container';
import { cloneDeep, isEmpty, isUndefined, map, toLower } from 'lodash';
import { EntityTags, TagOption } from 'Models';
import React, { FC, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  updateContainerColumnDescription,
  updateContainerColumnTags,
} from 'utils/ContainerDetailUtils';
import { getTableExpandableConfig } from 'utils/TableUtils';
import {
  CellRendered,
  ContainerDataModelProps,
} from './ContainerDataModel.interface';

import { ReactComponent as EditIcon } from 'assets/svg/edit-new.svg';
import ErrorPlaceHolder from 'components/common/error-with-placeholder/ErrorPlaceHolder';
import { ModalWithMarkdownEditor } from 'components/Modals/ModalWithMarkdownEditor/ModalWithMarkdownEditor';
import TableTags from 'components/TableTags/TableTags.component';
import { TagSource } from 'generated/type/tagLabel';
import { getEntityName } from 'utils/EntityUtils';
import { fetchGlossaryTerms, getGlossaryTermlist } from 'utils/GlossaryUtils';
import { getFilterTags } from 'utils/TableTags/TableTags.utils';
import { getClassifications, getTaglist } from 'utils/TagsUtils';

const ContainerDataModel: FC<ContainerDataModelProps> = ({
  dataModel,
  hasDescriptionEditAccess,
  hasTagEditAccess,
  isReadOnly,
  onUpdate,
}) => {
  const { t } = useTranslation();

  const [editContainerColumnDescription, setEditContainerColumnDescription] =
    useState<Column>();

  const [isTagLoading, setIsTagLoading] = useState<boolean>(false);
  const [isGlossaryLoading, setIsGlossaryLoading] = useState<boolean>(false);
  const [tagFetchFailed, setTagFetchFailed] = useState<boolean>(false);
  const [glossaryTags, setGlossaryTags] = useState<TagOption[]>([]);
  const [classificationTags, setClassificationTags] = useState<TagOption[]>([]);

  const fetchGlossaryTags = async () => {
    setIsGlossaryLoading(true);
    try {
      const res = await fetchGlossaryTerms();

      const glossaryTerms: TagOption[] = getGlossaryTermlist(res).map(
        (tag) => ({ fqn: tag, source: TagSource.Glossary })
      );
      setGlossaryTags(glossaryTerms);
    } catch {
      setTagFetchFailed(true);
    } finally {
      setIsGlossaryLoading(false);
    }
  };

  const fetchClassificationTags = async () => {
    setIsTagLoading(true);
    try {
      const res = await getClassifications();
      const tagList = await getTaglist(res.data);

      const classificationTag: TagOption[] = map(tagList, (tag) => ({
        fqn: tag,
        source: TagSource.Classification,
      }));

      setClassificationTags(classificationTag);
    } catch {
      setTagFetchFailed(true);
    } finally {
      setIsTagLoading(false);
    }
  };

  const handleFieldTagsChange = useCallback(
    async (
      selectedTags: EntityTags[],
      editColumnTag: Column,
      otherTags: TagLabel[]
    ) => {
      const newSelectedTags: TagOption[] = map(
        [...selectedTags, ...otherTags],
        (tag) => ({ fqn: tag.tagFQN, source: tag.source })
      );

      if (newSelectedTags && editColumnTag) {
        const containerDataModel = cloneDeep(dataModel);

        updateContainerColumnTags(
          containerDataModel?.columns,
          editColumnTag.name,
          newSelectedTags
        );

        await onUpdate(containerDataModel);
      }
    },
    [dataModel, onUpdate]
  );

  const handleContainerColumnDescriptionChange = async (
    updatedDescription: string
  ) => {
    if (!isUndefined(editContainerColumnDescription)) {
      const containerDataModel = cloneDeep(dataModel);
      updateContainerColumnDescription(
        containerDataModel?.columns,
        editContainerColumnDescription?.name,
        updatedDescription
      );
      await onUpdate(containerDataModel);
    }
    setEditContainerColumnDescription(undefined);
  };

  const renderContainerColumnDescription: CellRendered<Column, 'description'> =
    (description, record, index) => {
      return (
        <Space
          className="custom-group w-full"
          data-testid="description"
          id={`field-description-${index}`}
          size={4}>
          <>
            {description ? (
              <RichTextEditorPreviewer markdown={description} />
            ) : (
              <Typography.Text className="tw-no-description">
                {t('label.no-entity', {
                  entity: t('label.description'),
                })}
              </Typography.Text>
            )}
          </>
          {isReadOnly || !hasDescriptionEditAccess ? null : (
            <Button
              className="p-0 opacity-0 group-hover-opacity-100 flex-center"
              data-testid="edit-button"
              icon={<EditIcon width="16px" />}
              type="text"
              onClick={() => setEditContainerColumnDescription(record)}
            />
          )}
        </Space>
      );
    };

  const columns: ColumnsType<Column> = useMemo(
    () => [
      {
        title: t('label.name'),
        dataIndex: 'name',
        key: 'name',
        accessor: 'name',
        width: 300,
        render: (_, record: Column) => (
          <Popover
            destroyTooltipOnHide
            content={getEntityName(record)}
            trigger="hover">
            <Typography.Text>{getEntityName(record)}</Typography.Text>
          </Popover>
        ),
      },
      {
        title: t('label.type'),
        dataIndex: 'dataTypeDisplay',
        key: 'dataTypeDisplay',
        accessor: 'dataTypeDisplay',
        ellipsis: true,
        width: 220,
        render: (
          dataTypeDisplay: Column['dataTypeDisplay'],
          record: Column
        ) => {
          return (
            <Popover
              destroyTooltipOnHide
              content={toLower(dataTypeDisplay)}
              overlayInnerStyle={{
                maxWidth: '420px',
                overflowWrap: 'break-word',
                textAlign: 'center',
              }}
              trigger="hover">
              <Typography.Text ellipsis className="cursor-pointer">
                {dataTypeDisplay || record.dataType}
              </Typography.Text>
            </Popover>
          );
        },
      },
      {
        title: t('label.description'),
        dataIndex: 'description',
        key: 'description',
        accessor: 'description',
        render: renderContainerColumnDescription,
      },
      {
        title: t('label.tag-plural'),
        dataIndex: 'tags',
        key: 'tags',
        accessor: 'tags',
        width: 300,
        render: (tags: TagLabel[], record: Column, index: number) => (
          <TableTags<Column>
            dataTestId="classification-tags"
            fetchTags={fetchClassificationTags}
            handleTagSelection={handleFieldTagsChange}
            hasTagEditAccess={hasTagEditAccess}
            index={index}
            isReadOnly={isReadOnly}
            isTagLoading={isTagLoading}
            record={record}
            tagFetchFailed={tagFetchFailed}
            tagList={classificationTags}
            tags={getFilterTags(tags)}
            type={TagSource.Classification}
          />
        ),
      },
      {
        title: t('label.glossary-term-plural'),
        dataIndex: 'tags',
        key: 'tags',
        accessor: 'tags',
        width: 300,
        render: (tags: TagLabel[], record: Column, index: number) => (
          <TableTags<Column>
            dataTestId="glossary-tags"
            fetchTags={fetchGlossaryTags}
            handleTagSelection={handleFieldTagsChange}
            hasTagEditAccess={hasTagEditAccess}
            index={index}
            isReadOnly={isReadOnly}
            isTagLoading={isGlossaryLoading}
            record={record}
            tagFetchFailed={tagFetchFailed}
            tagList={glossaryTags}
            tags={getFilterTags(tags)}
            type={TagSource.Glossary}
          />
        ),
      },
    ],
    [
      classificationTags,
      tagFetchFailed,
      glossaryTags,
      fetchClassificationTags,
      fetchGlossaryTags,
      handleFieldTagsChange,
      hasDescriptionEditAccess,
      hasTagEditAccess,
      editContainerColumnDescription,
      isReadOnly,
      isTagLoading,
      isGlossaryLoading,
    ]
  );

  if (isEmpty(dataModel?.columns)) {
    return <ErrorPlaceHolder />;
  }

  return (
    <>
      <Table
        bordered
        columns={columns}
        data-testid="container-data-model-table"
        dataSource={dataModel?.columns}
        expandable={{
          ...getTableExpandableConfig<Column>(),
          rowExpandable: (record) => !isEmpty(record.children),
        }}
        pagination={false}
        rowKey="name"
        size="small"
      />
      {editContainerColumnDescription && (
        <ModalWithMarkdownEditor
          header={`${t('label.edit-entity', {
            entity: t('label.column'),
          })}: "${editContainerColumnDescription.name}"`}
          placeholder={t('label.enter-field-description', {
            field: t('label.column'),
          })}
          value={editContainerColumnDescription.description ?? ''}
          visible={Boolean(editContainerColumnDescription)}
          onCancel={() => setEditContainerColumnDescription(undefined)}
          onSave={handleContainerColumnDescriptionChange}
        />
      )}
    </>
  );
};

export default ContainerDataModel;
