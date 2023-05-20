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

import { isEmpty } from 'lodash';
import LineagePage from 'pages/LineagePage/LineagePage';
import React, { FunctionComponent, useMemo } from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import AppState from '../../AppState';
import { ROUTES } from '../../constants/constants';
import { Operation } from '../../generated/entity/policies/policy';
import { checkPermission, userPermissions } from '../../utils/PermissionsUtils';
import { usePermissionProvider } from '../PermissionProvider/PermissionProvider';
import { ResourceEntity } from '../PermissionProvider/PermissionProvider.interface';
import AdminProtectedRoute from './AdminProtectedRoute';
import withSuspenseFallback from './withSuspenseFallback';

const GlobalSettingPage = withSuspenseFallback(
  React.lazy(() => import('pages/GlobalSettingPage/GlobalSettingPage'))
);

const ProfilerDashboardPage = withSuspenseFallback(
  React.lazy(() => import('pages/ProfilerDashboardPage/ProfilerDashboardPage'))
);

const TestSuiteIngestionPage = withSuspenseFallback(
  React.lazy(
    () => import('pages/TestSuiteIngestionPage/TestSuiteIngestionPage')
  )
);

const TestSuiteDetailsPage = withSuspenseFallback(
  React.lazy(
    () => import('pages/TestSuiteDetailsPage/TestSuiteDetailsPage.component')
  )
);

const AddDataQualityTestPage = withSuspenseFallback(
  React.lazy(
    () => import('pages/AddDataQualityTestPage/AddDataQualityTestPage')
  )
);

const AddCustomProperty = withSuspenseFallback(
  React.lazy(
    () => import('../CustomEntityDetail/AddCustomProperty/AddCustomProperty')
  )
);

const MyDataPage = withSuspenseFallback(
  React.lazy(() => import('pages/MyDataPage/MyDataPage.component'))
);

const PipelineDetailsPage = withSuspenseFallback(
  React.lazy(
    () => import('pages/PipelineDetails/PipelineDetailsPage.component')
  )
);
const BotDetailsPage = withSuspenseFallback(
  React.lazy(() => import('pages/BotDetailsPage/BotDetailsPage'))
);
const ServicePage = withSuspenseFallback(
  React.lazy(() => import('pages/service'))
);
const SignupPage = withSuspenseFallback(
  React.lazy(() => import('pages/signup'))
);
const SwaggerPage = withSuspenseFallback(
  React.lazy(() => import('pages/swagger'))
);
const TagsPage = withSuspenseFallback(React.lazy(() => import('pages/tags')));
const TopicDetailsPage = withSuspenseFallback(
  React.lazy(() => import('pages/TopicDetails/TopicDetailsPage.component'))
);
const TourPageComponent = withSuspenseFallback(
  React.lazy(() => import('pages/tour-page/TourPage.component'))
);
const UserPage = withSuspenseFallback(
  React.lazy(() => import('pages/UserPage/UserPage.component'))
);

const GlossaryVersionPage = withSuspenseFallback(
  React.lazy(
    () => import('../../components/GlossaryVersion/GlossaryVersion.component')
  )
);

const AddGlossaryPage = withSuspenseFallback(
  React.lazy(() => import('pages/AddGlossary/AddGlossaryPage.component'))
);

const AddIngestionPage = withSuspenseFallback(
  React.lazy(() => import('pages/AddIngestionPage/AddIngestionPage.component'))
);
const AddServicePage = withSuspenseFallback(
  React.lazy(() => import('pages/AddServicePage/AddServicePage.component'))
);
const EditConnectionFormPage = withSuspenseFallback(
  React.lazy(
    () =>
      import('pages/EditConnectionFormPage/EditConnectionFormPage.component')
  )
);

const CreateUserPage = withSuspenseFallback(
  React.lazy(() => import('pages/CreateUserPage/CreateUserPage.component'))
);
const DashboardDetailsPage = withSuspenseFallback(
  React.lazy(
    () => import('pages/DashboardDetailsPage/DashboardDetailsPage.component')
  )
);
const DatabaseDetails = withSuspenseFallback(
  React.lazy(() => import('pages/database-details/index'))
);
const DatabaseSchemaPageComponent = withSuspenseFallback(
  React.lazy(
    () => import('pages/DatabaseSchemaPage/DatabaseSchemaPage.component')
  )
);

const DataModelDetailsPage = withSuspenseFallback(
  React.lazy(() => import('pages/DataModelPage/DataModelPage.component'))
);

const DatasetDetailsPage = withSuspenseFallback(
  React.lazy(
    () => import('pages/DatasetDetailsPage/DatasetDetailsPage.component')
  )
);
const EditIngestionPage = withSuspenseFallback(
  React.lazy(
    () => import('pages/EditIngestionPage/EditIngestionPage.component')
  )
);
const EntityVersionPage = withSuspenseFallback(
  React.lazy(
    () => import('pages/EntityVersionPage/EntityVersionPage.component')
  )
);
const ExplorePage = withSuspenseFallback(
  React.lazy(() => import('pages/explore/ExplorePage.component'))
);

const GlossaryPage = withSuspenseFallback(
  React.lazy(() => import('pages/Glossary/GlossaryPage/GlossaryPage.component'))
);

const MlModelPage = withSuspenseFallback(
  React.lazy(() => import('pages/MlModelPage/MlModelPage.component'))
);

const RequestDescriptionPage = withSuspenseFallback(
  React.lazy(
    () =>
      import('pages/TasksPage/RequestDescriptionPage/RequestDescriptionPage')
  )
);

const RequestTagsPage = withSuspenseFallback(
  React.lazy(() => import('pages/TasksPage/RequestTagPage/RequestTagPage'))
);

const UpdateDescriptionPage = withSuspenseFallback(
  React.lazy(
    () => import('pages/TasksPage/UpdateDescriptionPage/UpdateDescriptionPage')
  )
);

const UpdateTagsPage = withSuspenseFallback(
  React.lazy(() => import('pages/TasksPage/UpdateTagPage/UpdateTagPage'))
);

const TaskDetailPage = withSuspenseFallback(
  React.lazy(() => import('pages/TasksPage/TaskDetailPage/TaskDetailPage'))
);

const AddRolePage = withSuspenseFallback(
  React.lazy(() => import('pages/RolesPage/AddRolePage/AddRolePage'))
);
const AddPolicyPage = withSuspenseFallback(
  React.lazy(() => import('pages/PoliciesPage/AddPolicyPage/AddPolicyPage'))
);

const EditEmailConfigPage = withSuspenseFallback(
  React.lazy(
    () => import('pages/EditEmailConfigPage/EditEmailConfigPage.component')
  )
);
const EditCustomLogoConfigPage = withSuspenseFallback(
  React.lazy(() => import('pages/EditCustomLogoConfig/EditCustomLogoConfig'))
);

const AddRulePage = withSuspenseFallback(
  React.lazy(() => import('pages/PoliciesPage/PoliciesDetailPage/AddRulePage'))
);
const EditRulePage = withSuspenseFallback(
  React.lazy(() => import('pages/PoliciesPage/PoliciesDetailPage/EditRulePage'))
);

const TestSuitePage = withSuspenseFallback(
  React.lazy(() => import('pages/TestSuitePage/TestSuitePage'))
);

const TestCaseDetailsPage = withSuspenseFallback(
  React.lazy(
    () => import('pages/TestCaseDetailsPage/TestCaseDetailsPage.component')
  )
);

const LogsViewer = withSuspenseFallback(
  React.lazy(() => import('pages/LogsViewer/LogsViewer.component'))
);

const DataInsightPage = withSuspenseFallback(
  React.lazy(() => import('pages/DataInsightPage/DataInsightPage.component'))
);

const AddKPIPage = withSuspenseFallback(
  React.lazy(() => import('pages/KPIPage/AddKPIPage'))
);

const EditKPIPage = withSuspenseFallback(
  React.lazy(() => import('pages/KPIPage/EditKPIPage'))
);

const AddTestSuitePage = withSuspenseFallback(
  React.lazy(() => import('pages/TestSuitePage/TestSuiteStepper'))
);

const ContainerPage = withSuspenseFallback(
  React.lazy(() => import('pages/ContainerPage/ContainerPage'))
);

const QueryPage = withSuspenseFallback(
  React.lazy(() => import('pages/QueryPage/QueryPage.component'))
);
const AddQueryPage = withSuspenseFallback(
  React.lazy(() => import('pages/AddQueryPage/AddQueryPage.component'))
);

const PageNotFound = withSuspenseFallback(
  React.lazy(() => import('pages/page-not-found'))
);

const AuthenticatedAppRouter: FunctionComponent = () => {
  const { permissions } = usePermissionProvider();

  const glossaryPermission = useMemo(
    () =>
      userPermissions.hasViewPermissions(ResourceEntity.GLOSSARY, permissions),
    [permissions]
  );

  const glossaryTermPermission = useMemo(
    () =>
      userPermissions.hasViewPermissions(
        ResourceEntity.GLOSSARY_TERM,
        permissions
      ),

    [permissions]
  );

  const tagCategoryPermission = useMemo(
    () =>
      userPermissions.hasViewPermissions(
        ResourceEntity.CLASSIFICATION,
        permissions
      ),

    [permissions]
  );

  const createBotPermission = useMemo(
    () =>
      checkPermission(Operation.Create, ResourceEntity.USER, permissions) &&
      checkPermission(Operation.Create, ResourceEntity.BOT, permissions),
    [permissions]
  );

  return (
    <Switch>
      <Route exact component={MyDataPage} path={ROUTES.MY_DATA} />
      <Route exact component={TourPageComponent} path={ROUTES.TOUR} />
      <Route exact component={ExplorePage} path={ROUTES.EXPLORE} />
      <Route component={ExplorePage} path={ROUTES.EXPLORE_WITH_TAB} />
      <Route
        exact
        component={EditConnectionFormPage}
        path={ROUTES.EDIT_SERVICE_CONNECTION}
      />
      <Route exact component={ServicePage} path={ROUTES.SERVICE} />
      <Route exact component={ServicePage} path={ROUTES.SERVICE_WITH_TAB} />
      <Route exact component={AddServicePage} path={ROUTES.ADD_SERVICE} />
      <Route exact component={QueryPage} path={ROUTES.QUERY_FULL_SCREEN_VIEW} />
      <Route exact component={AddQueryPage} path={ROUTES.ADD_QUERY} />
      <AdminProtectedRoute
        exact
        component={AddIngestionPage}
        hasPermission={checkPermission(
          Operation.Create,
          ResourceEntity.INGESTION_PIPELINE,
          permissions
        )}
        path={ROUTES.ADD_INGESTION}
      />
      <AdminProtectedRoute
        exact
        component={EditIngestionPage}
        hasPermission={checkPermission(
          Operation.EditAll,
          ResourceEntity.INGESTION_PIPELINE,
          permissions
        )}
        path={ROUTES.EDIT_INGESTION}
      />
      <Route exact component={SignupPage} path={ROUTES.SIGNUP}>
        {!isEmpty(AppState.userDetails) && <Redirect to={ROUTES.HOME} />}
      </Route>

      <Route exact component={SwaggerPage} path={ROUTES.SWAGGER} />
      <AdminProtectedRoute
        exact
        component={TagsPage}
        hasPermission={tagCategoryPermission}
        path={ROUTES.TAGS}
      />
      <AdminProtectedRoute
        exact
        component={TagsPage}
        hasPermission={tagCategoryPermission}
        path={ROUTES.TAG_DETAILS}
      />
      <Route exact component={DatabaseDetails} path={ROUTES.DATABASE_DETAILS} />
      <Route
        exact
        component={DatabaseDetails}
        path={ROUTES.DATABASE_DETAILS_WITH_TAB}
      />
      <Route
        exact
        component={DatabaseSchemaPageComponent}
        path={ROUTES.SCHEMA_DETAILS}
      />
      <Route
        exact
        component={DatabaseSchemaPageComponent}
        path={ROUTES.SCHEMA_DETAILS_WITH_TAB}
      />
      <Route exact component={DatasetDetailsPage} path={ROUTES.TABLE_DETAILS} />
      <Route
        exact
        component={DatasetDetailsPage}
        path={ROUTES.TABLE_DETAILS_WITH_TAB}
      />
      <Route exact component={TopicDetailsPage} path={ROUTES.TOPIC_DETAILS} />
      <Route
        exact
        component={TopicDetailsPage}
        path={ROUTES.TOPIC_DETAILS_WITH_TAB}
      />
      <Route
        exact
        component={DashboardDetailsPage}
        path={ROUTES.DASHBOARD_DETAILS}
      />
      <Route
        exact
        component={DashboardDetailsPage}
        path={ROUTES.DASHBOARD_DETAILS_WITH_TAB}
      />
      <Route
        exact
        component={DataModelDetailsPage}
        path={ROUTES.DATA_MODEL_DETAILS}
      />
      <Route
        exact
        component={DataModelDetailsPage}
        path={ROUTES.DATA_MODEL_DETAILS_WITH_TAB}
      />
      <Route
        exact
        component={() => <GlossaryVersionPage isGlossary />}
        path={ROUTES.GLOSSARY_VERSION}
      />
      <Route
        exact
        component={GlossaryVersionPage}
        path={ROUTES.GLOSSARY_TERMS_VERSION}
      />
      <Route
        exact
        component={GlossaryVersionPage}
        path={ROUTES.GLOSSARY_TERMS_VERSION_TAB}
      />
      <Route
        exact
        component={PipelineDetailsPage}
        path={ROUTES.PIPELINE_DETAILS}
      />
      <Route exact component={ContainerPage} path={ROUTES.CONTAINER_DETAILS} />
      <Route
        exact
        component={ContainerPage}
        path={ROUTES.CONTAINER_DETAILS_WITH_TAB}
      />
      <Route
        exact
        component={PipelineDetailsPage}
        path={ROUTES.PIPELINE_DETAILS_WITH_TAB}
      />
      <Route exact component={EntityVersionPage} path={ROUTES.ENTITY_VERSION} />
      <AdminProtectedRoute
        exact
        component={GlossaryPage}
        hasPermission={glossaryPermission}
        path={ROUTES.GLOSSARY}
      />
      <AdminProtectedRoute
        exact
        component={GlossaryPage}
        hasPermission={glossaryPermission}
        path={ROUTES.GLOSSARY_DETAILS}
      />
      <AdminProtectedRoute
        exact
        component={GlossaryPage}
        hasPermission={glossaryPermission}
        path={ROUTES.GLOSSARY_DETAILS_WITH_ACTION}
      />
      <Route exact component={UserPage} path={ROUTES.USER_PROFILE} />
      <Route exact component={UserPage} path={ROUTES.USER_PROFILE_WITH_TAB} />
      <Route exact component={MlModelPage} path={ROUTES.MLMODEL_DETAILS} />
      <Route
        exact
        component={AddDataQualityTestPage}
        path={ROUTES.ADD_DATA_QUALITY_TEST_CASE}
      />
      <Route
        exact
        component={ProfilerDashboardPage}
        path={ROUTES.PROFILER_DASHBOARD}
      />
      <Route
        exact
        component={ProfilerDashboardPage}
        path={ROUTES.PROFILER_DASHBOARD_WITH_TAB}
      />
      <Route
        exact
        component={MlModelPage}
        path={ROUTES.MLMODEL_DETAILS_WITH_TAB}
      />
      <Route exact component={AddGlossaryPage} path={ROUTES.ADD_GLOSSARY} />
      <AdminProtectedRoute
        exact
        component={GlossaryPage}
        hasPermission={glossaryTermPermission}
        path={ROUTES.GLOSSARY_TERMS}
      />
      <AdminProtectedRoute
        exact
        component={GlossaryPage}
        hasPermission={glossaryPermission}
        path={ROUTES.GLOSSARY_DETAILS_WITH_TAB}
      />
      <AdminProtectedRoute
        exact
        component={GlossaryPage}
        hasPermission={glossaryTermPermission}
        path={ROUTES.GLOSSARY_TERMS}
      />
      <AdminProtectedRoute
        exact
        component={CreateUserPage}
        hasPermission={checkPermission(
          Operation.Create,
          ResourceEntity.USER,
          permissions
        )}
        path={ROUTES.CREATE_USER}
      />
      <AdminProtectedRoute
        exact
        component={CreateUserPage}
        hasPermission={createBotPermission}
        path={ROUTES.CREATE_USER_WITH_BOT}
      />
      <Route exact component={BotDetailsPage} path={ROUTES.BOTS_PROFILE} />
      <Route
        exact
        component={AddCustomProperty}
        path={ROUTES.ADD_CUSTOM_PROPERTY}
      />
      <Route
        exact
        component={RequestDescriptionPage}
        path={ROUTES.REQUEST_DESCRIPTION}
      />
      <Route
        exact
        component={UpdateDescriptionPage}
        path={ROUTES.UPDATE_DESCRIPTION}
      />

      <Route exact component={TaskDetailPage} path={ROUTES.TASK_DETAIL} />
      <Route exact component={RequestTagsPage} path={ROUTES.REQUEST_TAGS} />
      <Route exact component={UpdateTagsPage} path={ROUTES.UPDATE_TAGS} />
      <Route
        exact
        component={LineagePage}
        path={ROUTES.LINEAGE_FULL_SCREEN_VIEW}
      />

      {/* keep these route above the setting route always */}
      <AdminProtectedRoute
        exact
        component={AddRolePage}
        hasPermission={checkPermission(
          Operation.Create,
          ResourceEntity.ROLE,
          permissions
        )}
        path={ROUTES.ADD_ROLE}
      />
      <AdminProtectedRoute
        exact
        component={AddPolicyPage}
        hasPermission={checkPermission(
          Operation.Create,
          ResourceEntity.POLICY,
          permissions
        )}
        path={ROUTES.ADD_POLICY}
      />
      <Route exact component={AddRulePage} path={ROUTES.ADD_POLICY_RULE} />
      <AdminProtectedRoute
        exact
        component={EditEmailConfigPage}
        hasPermission={false}
        path={ROUTES.SETTINGS_EDIT_EMAIL_CONFIG}
      />
      <AdminProtectedRoute
        exact
        component={EditCustomLogoConfigPage}
        hasPermission={false}
        path={ROUTES.SETTINGS_EDIT_CUSTOM_LOGO_CONFIG}
      />
      <Route exact component={EditRulePage} path={ROUTES.EDIT_POLICY_RULE} />

      <Route exact component={GlobalSettingPage} path={ROUTES.SETTINGS} />
      <Route
        exact
        component={GlobalSettingPage}
        path={ROUTES.SETTINGS_WITH_TAB}
      />
      <Route
        exact
        component={GlobalSettingPage}
        path={ROUTES.SETTINGS_WITH_TAB_FQN}
      />
      <Route
        exact
        component={TestSuiteDetailsPage}
        path={ROUTES.TEST_SUITES_WITH_FQN}
      />
      <Route exact component={LogsViewer} path={ROUTES.LOGS} />
      <Route
        exact
        component={TestSuiteIngestionPage}
        path={ROUTES.TEST_SUITES_ADD_INGESTION}
      />
      <Route
        exact
        component={TestSuiteIngestionPage}
        path={ROUTES.TEST_SUITES_EDIT_INGESTION}
      />
      <AdminProtectedRoute
        exact
        component={TestSuitePage}
        hasPermission={userPermissions.hasViewPermissions(
          ResourceEntity.TEST_SUITE,
          permissions
        )}
        path={ROUTES.TEST_SUITES}
      />
      <AdminProtectedRoute
        exact
        component={TestCaseDetailsPage}
        hasPermission={userPermissions.hasViewPermissions(
          ResourceEntity.TEST_CASE,
          permissions
        )}
        path={ROUTES.TEST_CASE_DETAILS}
      />
      <Route exact component={DataInsightPage} path={ROUTES.DATA_INSIGHT} />
      <Route
        exact
        component={DataInsightPage}
        path={ROUTES.DATA_INSIGHT_WITH_TAB}
      />
      <Route exact component={AddKPIPage} path={ROUTES.ADD_KPI} />
      <Route exact component={EditKPIPage} path={ROUTES.EDIT_KPI} />
      <Route exact component={AddTestSuitePage} path={ROUTES.ADD_TEST_SUITES} />
      <Route exact path={ROUTES.HOME}>
        <Redirect to={ROUTES.MY_DATA} />
      </Route>
      <Route exact component={PageNotFound} path={ROUTES.NOT_FOUND} />
      <Redirect to={ROUTES.NOT_FOUND} />
    </Switch>
  );
};

export default AuthenticatedAppRouter;
