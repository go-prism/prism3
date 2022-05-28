import * as Apollo from '@apollo/client';
import {gql} from '@apollo/client';

export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
const defaultOptions = {} as const;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  StringMap: any;
  Strings: any;
};

export enum Archetype {
  Alpine = 'ALPINE',
  Debian = 'DEBIAN',
  Generic = 'GENERIC',
  Go = 'GO',
  Helm = 'HELM',
  Maven = 'MAVEN',
  Npm = 'NPM',
  Pip = 'PIP',
  Rust = 'RUST'
}

export type Artifact = {
  __typename?: 'Artifact';
  createdAt: Scalars['Int'];
  downloads: Scalars['Int'];
  id: Scalars['ID'];
  remoteID: Scalars['ID'];
  slices: Scalars['Strings'];
  updatedAt: Scalars['Int'];
  uri: Scalars['String'];
};

export enum AuthMode {
  Direct = 'DIRECT',
  None = 'NONE',
  Proxy = 'PROXY'
}

export type Mutation = {
  __typename?: 'Mutation';
  createRefraction: Refraction;
  createRemote: Remote;
  createRoleBinding: RoleBinding;
  createTransportProfile: TransportSecurity;
  deleteRefraction: Scalars['Boolean'];
  deleteRemote: Scalars['Boolean'];
  patchRefraction: Refraction;
  patchRemote: Remote;
  setPreference: Scalars['Boolean'];
};


export type MutationCreateRefractionArgs = {
  input: NewRefract;
};


export type MutationCreateRemoteArgs = {
  input: NewRemote;
};


export type MutationCreateRoleBindingArgs = {
  input: NewRoleBinding;
};


export type MutationCreateTransportProfileArgs = {
  input: NewTransportProfile;
};


export type MutationDeleteRefractionArgs = {
  id: Scalars['ID'];
};


export type MutationDeleteRemoteArgs = {
  id: Scalars['ID'];
};


export type MutationPatchRefractionArgs = {
  id: Scalars['ID'];
  input: PatchRefract;
};


export type MutationPatchRemoteArgs = {
  id: Scalars['ID'];
  input: PatchRemote;
};


export type MutationSetPreferenceArgs = {
  key: Scalars['String'];
  value: Scalars['String'];
};

export type NewRefract = {
  archetype: Archetype;
  name: Scalars['String'];
  remotes: Array<Scalars['ID']>;
};

export type NewRemote = {
  archetype: Archetype;
  authMode: AuthMode;
  name: Scalars['String'];
  transport: Scalars['ID'];
  uri: Scalars['String'];
};

export type NewRoleBinding = {
  resource: Scalars['String'];
  subject: Scalars['String'];
  verb: Verb;
};

export type NewTransportProfile = {
  ca: Scalars['String'];
  cert: Scalars['String'];
  httpProxy: Scalars['String'];
  httpsProxy: Scalars['String'];
  key: Scalars['String'];
  name: Scalars['String'];
  noProxy: Scalars['String'];
  skipTLSVerify?: Scalars['Boolean'];
};

export type Overview = {
  __typename?: 'Overview';
  artifacts: Scalars['Int'];
  downloads: Scalars['Int'];
  packages_helm: Scalars['Int'];
  packages_npm: Scalars['Int'];
  packages_pypi: Scalars['Int'];
  refractions: Scalars['Int'];
  remotes: Scalars['Int'];
  storage: Scalars['Int'];
  system_memory: Scalars['Int'];
  system_memory_os: Scalars['Int'];
  system_memory_total: Scalars['Int'];
  uptime: Scalars['Int'];
  users: Scalars['Int'];
  version: Scalars['String'];
};

export type PatchRefract = {
  name: Scalars['String'];
  remotes: Array<Scalars['ID']>;
};

export type PatchRemote = {
  allowed: Array<Scalars['String']>;
  authHeaders: Array<Scalars['String']>;
  authMode: AuthMode;
  blocked: Array<Scalars['String']>;
  directHeader: Scalars['String'];
  directToken: Scalars['String'];
  transportID: Scalars['ID'];
};

export type Query = {
  __typename?: 'Query';
  getCurrentUser: StoredUser;
  getOverview: Overview;
  getRefraction: Refraction;
  getRemote: Remote;
  getRemoteOverview: RemoteOverview;
  getRoleBindings: Array<RoleBinding>;
  getUsers: Array<RoleBinding>;
  listArtifacts: Array<Artifact>;
  listCombinedArtifacts: Array<Artifact>;
  listRefractions: Array<Refraction>;
  listRemotes: Array<Remote>;
  listTransports: Array<TransportSecurity>;
  listUsers: Array<StoredUser>;
};


export type QueryGetRefractionArgs = {
  id: Scalars['ID'];
};


export type QueryGetRemoteArgs = {
  id: Scalars['ID'];
};


export type QueryGetRemoteOverviewArgs = {
  id: Scalars['ID'];
};


export type QueryGetRoleBindingsArgs = {
  user: Scalars['String'];
};


export type QueryGetUsersArgs = {
  resource: Scalars['String'];
};


export type QueryListArtifactsArgs = {
  remote: Scalars['ID'];
};


export type QueryListCombinedArtifactsArgs = {
  refract: Scalars['ID'];
};


export type QueryListRemotesArgs = {
  arch: Scalars['String'];
};

export type Refraction = {
  __typename?: 'Refraction';
  archetype: Archetype;
  createdAt: Scalars['Int'];
  id: Scalars['ID'];
  name: Scalars['String'];
  remotes: Array<Remote>;
  updatedAt: Scalars['Int'];
};

export type Remote = {
  __typename?: 'Remote';
  archetype: Archetype;
  createdAt: Scalars['Int'];
  enabled: Scalars['Boolean'];
  id: Scalars['ID'];
  name: Scalars['String'];
  security: RemoteSecurity;
  securityID: Scalars['ID'];
  transport: TransportSecurity;
  transportID: Scalars['ID'];
  updatedAt: Scalars['Int'];
  uri: Scalars['String'];
};

export type RemoteOverview = {
  __typename?: 'RemoteOverview';
  artifacts: Scalars['Int'];
  storage: Scalars['Int'];
};

export type RemoteSecurity = {
  __typename?: 'RemoteSecurity';
  allowed: Scalars['Strings'];
  authHeaders: Scalars['Strings'];
  authMode: AuthMode;
  blocked: Scalars['Strings'];
  directHeader: Scalars['String'];
  directToken: Scalars['String'];
  id: Scalars['ID'];
};

export enum Role {
  Power = 'POWER',
  Super = 'SUPER'
}

export type RoleBinding = {
  __typename?: 'RoleBinding';
  resource: Scalars['String'];
  subject: Scalars['String'];
  verb: Verb;
};

export type StoredUser = {
  __typename?: 'StoredUser';
  claims: Scalars['StringMap'];
  id: Scalars['ID'];
  iss: Scalars['String'];
  preferences: Scalars['StringMap'];
  sub: Scalars['String'];
};

export type Subscription = {
  __typename?: 'Subscription';
  getCurrentUser: StoredUser;
};

export type TransportSecurity = {
  __typename?: 'TransportSecurity';
  ca: Scalars['String'];
  cert: Scalars['String'];
  httpProxy: Scalars['String'];
  httpsProxy: Scalars['String'];
  id: Scalars['ID'];
  key: Scalars['String'];
  name: Scalars['String'];
  noProxy: Scalars['String'];
  skipTLSVerify: Scalars['Boolean'];
};

export type User = {
  __typename?: 'User';
  iss: Scalars['String'];
  sub: Scalars['String'];
};

export enum Verb {
  Create = 'CREATE',
  Delete = 'DELETE',
  Read = 'READ',
  Sudo = 'SUDO',
  Update = 'UPDATE'
}

export type GetOverviewQueryVariables = Exact<{ [key: string]: never; }>;


export type GetOverviewQuery = { __typename?: 'Query', getOverview: { __typename?: 'Overview', remotes: number, refractions: number, artifacts: number, storage: number, downloads: number, uptime: number, version: string, users: number, packages_pypi: number, packages_npm: number, packages_helm: number, system_memory: number, system_memory_os: number, system_memory_total: number } };

export type OverviewQueryVariables = Exact<{
  refract: Scalars['ID'];
}>;


export type OverviewQuery = { __typename?: 'Query', getRefraction: { __typename?: 'Refraction', id: string, name: string, createdAt: number, updatedAt: number, archetype: Archetype }, listCombinedArtifacts: Array<{ __typename?: 'Artifact', id: string, uri: string, updatedAt: number, createdAt: number, downloads: number }> };

export type CreateRoleBindingMutationVariables = Exact<{
  subject: Scalars['String'];
  resource: Scalars['String'];
  verb: Verb;
}>;


export type CreateRoleBindingMutation = { __typename?: 'Mutation', createRoleBinding: { __typename: 'RoleBinding' } };

export type GetCurrentUserQueryVariables = Exact<{ [key: string]: never; }>;


export type GetCurrentUserQuery = { __typename?: 'Query', getCurrentUser: { __typename?: 'StoredUser', id: string, sub: string, iss: string, claims: any, preferences: any } };

export type WatchCurrentUserSubscriptionVariables = Exact<{ [key: string]: never; }>;


export type WatchCurrentUserSubscription = { __typename?: 'Subscription', getCurrentUser: { __typename?: 'StoredUser', id: string, sub: string, iss: string, claims: any, preferences: any } };

export type GetRoleBindingsQueryVariables = Exact<{
  user: Scalars['String'];
}>;


export type GetRoleBindingsQuery = { __typename?: 'Query', getRoleBindings: Array<{ __typename?: 'RoleBinding', subject: string, resource: string, verb: Verb }> };

export type GetUsersQueryVariables = Exact<{
  resource: Scalars['String'];
}>;


export type GetUsersQuery = { __typename?: 'Query', getUsers: Array<{ __typename?: 'RoleBinding', subject: string, resource: string, verb: Verb }> };

export type ListUsersQueryVariables = Exact<{ [key: string]: never; }>;


export type ListUsersQuery = { __typename?: 'Query', listUsers: Array<{ __typename?: 'StoredUser', id: string, sub: string, claims: any }> };

export type SetPreferenceMutationVariables = Exact<{
  key: Scalars['String'];
  value: Scalars['String'];
}>;


export type SetPreferenceMutation = { __typename?: 'Mutation', setPreference: boolean };

export type PatchRefractMutationVariables = Exact<{
  id: Scalars['ID'];
  name: Scalars['String'];
  remotes: Array<Scalars['ID']> | Scalars['ID'];
}>;


export type PatchRefractMutation = { __typename?: 'Mutation', patchRefraction: { __typename?: 'Refraction', id: string } };

export type CreateRefractMutationVariables = Exact<{
  name: Scalars['String'];
  archetype: Archetype;
  remotes: Array<Scalars['ID']> | Scalars['ID'];
}>;


export type CreateRefractMutation = { __typename?: 'Mutation', createRefraction: { __typename?: 'Refraction', id: string } };

export type GetRefractionQueryVariables = Exact<{
  id: Scalars['ID'];
}>;


export type GetRefractionQuery = { __typename?: 'Query', getRefraction: { __typename?: 'Refraction', id: string, createdAt: number, updatedAt: number, name: string, archetype: Archetype, remotes: Array<{ __typename?: 'Remote', id: string, name: string }> } };

export type ListRefractionsQueryVariables = Exact<{ [key: string]: never; }>;


export type ListRefractionsQuery = { __typename?: 'Query', listRefractions: Array<{ __typename?: 'Refraction', id: string, createdAt: number, updatedAt: number, name: string, archetype: Archetype }> };

export type RefSelectQueryVariables = Exact<{ [key: string]: never; }>;


export type RefSelectQuery = { __typename?: 'Query', listRefractions: Array<{ __typename?: 'Refraction', id: string, name: string }> };

export type CreateRemoteMutationVariables = Exact<{
  name: Scalars['String'];
  uri: Scalars['String'];
  archetype: Archetype;
  transport: Scalars['ID'];
}>;


export type CreateRemoteMutation = { __typename?: 'Mutation', createRemote: { __typename?: 'Remote', id: string } };

export type PatchRemoteMutationVariables = Exact<{
  id: Scalars['ID'];
  transportID: Scalars['ID'];
  allowed: Array<Scalars['String']> | Scalars['String'];
  blocked: Array<Scalars['String']> | Scalars['String'];
  authHeaders: Array<Scalars['String']> | Scalars['String'];
  directHeader: Scalars['String'];
  directToken: Scalars['String'];
  authMode: AuthMode;
}>;


export type PatchRemoteMutation = { __typename?: 'Mutation', patchRemote: { __typename?: 'Remote', id: string } };

export type GetRemoteQueryVariables = Exact<{
  id: Scalars['ID'];
}>;


export type GetRemoteQuery = { __typename?: 'Query', getRemote: { __typename?: 'Remote', id: string, createdAt: number, updatedAt: number, name: string, uri: string, archetype: Archetype, enabled: boolean, security: { __typename?: 'RemoteSecurity', id: string, allowed: any, blocked: any, authMode: AuthMode, directHeader: string, directToken: string, authHeaders: any }, transport: { __typename?: 'TransportSecurity', id: string, name: string, cert: string, key: string, ca: string, skipTLSVerify: boolean, httpProxy: string, httpsProxy: string, noProxy: string } } };

export type ListRemotesQueryVariables = Exact<{
  arch: Scalars['String'];
}>;


export type ListRemotesQuery = { __typename?: 'Query', listRemotes: Array<{ __typename?: 'Remote', id: string, name: string, updatedAt: number, createdAt: number, uri: string, enabled: boolean, archetype: Archetype }> };

export type CreateTransportMutationVariables = Exact<{
  name: Scalars['String'];
  ca: Scalars['String'];
  cert: Scalars['String'];
  key: Scalars['String'];
  skipTLSVerify: Scalars['Boolean'];
  httpProxy: Scalars['String'];
  httpsProxy: Scalars['String'];
  noProxy: Scalars['String'];
}>;


export type CreateTransportMutation = { __typename?: 'Mutation', createTransportProfile: { __typename?: 'TransportSecurity', id: string } };

export type ListTransportsQueryVariables = Exact<{ [key: string]: never; }>;


export type ListTransportsQuery = { __typename?: 'Query', listTransports: Array<{ __typename?: 'TransportSecurity', id: string, name: string, skipTLSVerify: boolean, ca: string, cert: string, noProxy: string, httpProxy: string, httpsProxy: string }> };


export const GetOverviewDocument = gql`
    query getOverview {
  getOverview {
    remotes
    refractions
    artifacts
    storage
    downloads
    uptime
    version
    users
    packages_pypi
    packages_npm
    packages_helm
    system_memory
    system_memory_os
    system_memory_total
  }
}
    `;

/**
 * __useGetOverviewQuery__
 *
 * To run a query within a React component, call `useGetOverviewQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetOverviewQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetOverviewQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetOverviewQuery(baseOptions?: Apollo.QueryHookOptions<GetOverviewQuery, GetOverviewQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetOverviewQuery, GetOverviewQueryVariables>(GetOverviewDocument, options);
      }
export function useGetOverviewLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetOverviewQuery, GetOverviewQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetOverviewQuery, GetOverviewQueryVariables>(GetOverviewDocument, options);
        }
export type GetOverviewQueryHookResult = ReturnType<typeof useGetOverviewQuery>;
export type GetOverviewLazyQueryHookResult = ReturnType<typeof useGetOverviewLazyQuery>;
export type GetOverviewQueryResult = Apollo.QueryResult<GetOverviewQuery, GetOverviewQueryVariables>;
export const OverviewDocument = gql`
    query overview($refract: ID!) {
  getRefraction(id: $refract) {
    id
    name
    createdAt
    updatedAt
    archetype
  }
  listCombinedArtifacts(refract: $refract) {
    id
    uri
    updatedAt
    createdAt
    downloads
  }
}
    `;

/**
 * __useOverviewQuery__
 *
 * To run a query within a React component, call `useOverviewQuery` and pass it any options that fit your needs.
 * When your component renders, `useOverviewQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useOverviewQuery({
 *   variables: {
 *      refract: // value for 'refract'
 *   },
 * });
 */
export function useOverviewQuery(baseOptions: Apollo.QueryHookOptions<OverviewQuery, OverviewQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<OverviewQuery, OverviewQueryVariables>(OverviewDocument, options);
      }
export function useOverviewLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<OverviewQuery, OverviewQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<OverviewQuery, OverviewQueryVariables>(OverviewDocument, options);
        }
export type OverviewQueryHookResult = ReturnType<typeof useOverviewQuery>;
export type OverviewLazyQueryHookResult = ReturnType<typeof useOverviewLazyQuery>;
export type OverviewQueryResult = Apollo.QueryResult<OverviewQuery, OverviewQueryVariables>;
export const CreateRoleBindingDocument = gql`
    mutation createRoleBinding($subject: String!, $resource: String!, $verb: Verb!) {
  createRoleBinding(input: {subject: $subject, resource: $resource, verb: $verb}) {
    __typename
  }
}
    `;
export type CreateRoleBindingMutationFn = Apollo.MutationFunction<CreateRoleBindingMutation, CreateRoleBindingMutationVariables>;

/**
 * __useCreateRoleBindingMutation__
 *
 * To run a mutation, you first call `useCreateRoleBindingMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateRoleBindingMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createRoleBindingMutation, { data, loading, error }] = useCreateRoleBindingMutation({
 *   variables: {
 *      subject: // value for 'subject'
 *      resource: // value for 'resource'
 *      verb: // value for 'verb'
 *   },
 * });
 */
export function useCreateRoleBindingMutation(baseOptions?: Apollo.MutationHookOptions<CreateRoleBindingMutation, CreateRoleBindingMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateRoleBindingMutation, CreateRoleBindingMutationVariables>(CreateRoleBindingDocument, options);
      }
export type CreateRoleBindingMutationHookResult = ReturnType<typeof useCreateRoleBindingMutation>;
export type CreateRoleBindingMutationResult = Apollo.MutationResult<CreateRoleBindingMutation>;
export type CreateRoleBindingMutationOptions = Apollo.BaseMutationOptions<CreateRoleBindingMutation, CreateRoleBindingMutationVariables>;
export const GetCurrentUserDocument = gql`
    query getCurrentUser {
  getCurrentUser {
    id
    sub
    iss
    claims
    preferences
  }
}
    `;

/**
 * __useGetCurrentUserQuery__
 *
 * To run a query within a React component, call `useGetCurrentUserQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetCurrentUserQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetCurrentUserQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetCurrentUserQuery(baseOptions?: Apollo.QueryHookOptions<GetCurrentUserQuery, GetCurrentUserQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetCurrentUserQuery, GetCurrentUserQueryVariables>(GetCurrentUserDocument, options);
      }
export function useGetCurrentUserLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetCurrentUserQuery, GetCurrentUserQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetCurrentUserQuery, GetCurrentUserQueryVariables>(GetCurrentUserDocument, options);
        }
export type GetCurrentUserQueryHookResult = ReturnType<typeof useGetCurrentUserQuery>;
export type GetCurrentUserLazyQueryHookResult = ReturnType<typeof useGetCurrentUserLazyQuery>;
export type GetCurrentUserQueryResult = Apollo.QueryResult<GetCurrentUserQuery, GetCurrentUserQueryVariables>;
export const WatchCurrentUserDocument = gql`
    subscription watchCurrentUser {
  getCurrentUser {
    id
    sub
    iss
    claims
    preferences
  }
}
    `;

/**
 * __useWatchCurrentUserSubscription__
 *
 * To run a query within a React component, call `useWatchCurrentUserSubscription` and pass it any options that fit your needs.
 * When your component renders, `useWatchCurrentUserSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useWatchCurrentUserSubscription({
 *   variables: {
 *   },
 * });
 */
export function useWatchCurrentUserSubscription(baseOptions?: Apollo.SubscriptionHookOptions<WatchCurrentUserSubscription, WatchCurrentUserSubscriptionVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useSubscription<WatchCurrentUserSubscription, WatchCurrentUserSubscriptionVariables>(WatchCurrentUserDocument, options);
      }
export type WatchCurrentUserSubscriptionHookResult = ReturnType<typeof useWatchCurrentUserSubscription>;
export type WatchCurrentUserSubscriptionResult = Apollo.SubscriptionResult<WatchCurrentUserSubscription>;
export const GetRoleBindingsDocument = gql`
    query getRoleBindings($user: String!) {
  getRoleBindings(user: $user) {
    subject
    resource
    verb
  }
}
    `;

/**
 * __useGetRoleBindingsQuery__
 *
 * To run a query within a React component, call `useGetRoleBindingsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetRoleBindingsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetRoleBindingsQuery({
 *   variables: {
 *      user: // value for 'user'
 *   },
 * });
 */
export function useGetRoleBindingsQuery(baseOptions: Apollo.QueryHookOptions<GetRoleBindingsQuery, GetRoleBindingsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetRoleBindingsQuery, GetRoleBindingsQueryVariables>(GetRoleBindingsDocument, options);
      }
export function useGetRoleBindingsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetRoleBindingsQuery, GetRoleBindingsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetRoleBindingsQuery, GetRoleBindingsQueryVariables>(GetRoleBindingsDocument, options);
        }
export type GetRoleBindingsQueryHookResult = ReturnType<typeof useGetRoleBindingsQuery>;
export type GetRoleBindingsLazyQueryHookResult = ReturnType<typeof useGetRoleBindingsLazyQuery>;
export type GetRoleBindingsQueryResult = Apollo.QueryResult<GetRoleBindingsQuery, GetRoleBindingsQueryVariables>;
export const GetUsersDocument = gql`
    query getUsers($resource: String!) {
  getUsers(resource: $resource) {
    subject
    resource
    verb
  }
}
    `;

/**
 * __useGetUsersQuery__
 *
 * To run a query within a React component, call `useGetUsersQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetUsersQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetUsersQuery({
 *   variables: {
 *      resource: // value for 'resource'
 *   },
 * });
 */
export function useGetUsersQuery(baseOptions: Apollo.QueryHookOptions<GetUsersQuery, GetUsersQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetUsersQuery, GetUsersQueryVariables>(GetUsersDocument, options);
      }
export function useGetUsersLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetUsersQuery, GetUsersQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetUsersQuery, GetUsersQueryVariables>(GetUsersDocument, options);
        }
export type GetUsersQueryHookResult = ReturnType<typeof useGetUsersQuery>;
export type GetUsersLazyQueryHookResult = ReturnType<typeof useGetUsersLazyQuery>;
export type GetUsersQueryResult = Apollo.QueryResult<GetUsersQuery, GetUsersQueryVariables>;
export const ListUsersDocument = gql`
    query listUsers {
  listUsers {
    id
    sub
    claims
  }
}
    `;

/**
 * __useListUsersQuery__
 *
 * To run a query within a React component, call `useListUsersQuery` and pass it any options that fit your needs.
 * When your component renders, `useListUsersQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useListUsersQuery({
 *   variables: {
 *   },
 * });
 */
export function useListUsersQuery(baseOptions?: Apollo.QueryHookOptions<ListUsersQuery, ListUsersQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ListUsersQuery, ListUsersQueryVariables>(ListUsersDocument, options);
      }
export function useListUsersLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ListUsersQuery, ListUsersQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ListUsersQuery, ListUsersQueryVariables>(ListUsersDocument, options);
        }
export type ListUsersQueryHookResult = ReturnType<typeof useListUsersQuery>;
export type ListUsersLazyQueryHookResult = ReturnType<typeof useListUsersLazyQuery>;
export type ListUsersQueryResult = Apollo.QueryResult<ListUsersQuery, ListUsersQueryVariables>;
export const SetPreferenceDocument = gql`
    mutation setPreference($key: String!, $value: String!) {
  setPreference(key: $key, value: $value)
}
    `;
export type SetPreferenceMutationFn = Apollo.MutationFunction<SetPreferenceMutation, SetPreferenceMutationVariables>;

/**
 * __useSetPreferenceMutation__
 *
 * To run a mutation, you first call `useSetPreferenceMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSetPreferenceMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [setPreferenceMutation, { data, loading, error }] = useSetPreferenceMutation({
 *   variables: {
 *      key: // value for 'key'
 *      value: // value for 'value'
 *   },
 * });
 */
export function useSetPreferenceMutation(baseOptions?: Apollo.MutationHookOptions<SetPreferenceMutation, SetPreferenceMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<SetPreferenceMutation, SetPreferenceMutationVariables>(SetPreferenceDocument, options);
      }
export type SetPreferenceMutationHookResult = ReturnType<typeof useSetPreferenceMutation>;
export type SetPreferenceMutationResult = Apollo.MutationResult<SetPreferenceMutation>;
export type SetPreferenceMutationOptions = Apollo.BaseMutationOptions<SetPreferenceMutation, SetPreferenceMutationVariables>;
export const PatchRefractDocument = gql`
    mutation patchRefract($id: ID!, $name: String!, $remotes: [ID!]!) {
  patchRefraction(id: $id, input: {name: $name, remotes: $remotes}) {
    id
  }
}
    `;
export type PatchRefractMutationFn = Apollo.MutationFunction<PatchRefractMutation, PatchRefractMutationVariables>;

/**
 * __usePatchRefractMutation__
 *
 * To run a mutation, you first call `usePatchRefractMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `usePatchRefractMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [patchRefractMutation, { data, loading, error }] = usePatchRefractMutation({
 *   variables: {
 *      id: // value for 'id'
 *      name: // value for 'name'
 *      remotes: // value for 'remotes'
 *   },
 * });
 */
export function usePatchRefractMutation(baseOptions?: Apollo.MutationHookOptions<PatchRefractMutation, PatchRefractMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<PatchRefractMutation, PatchRefractMutationVariables>(PatchRefractDocument, options);
      }
export type PatchRefractMutationHookResult = ReturnType<typeof usePatchRefractMutation>;
export type PatchRefractMutationResult = Apollo.MutationResult<PatchRefractMutation>;
export type PatchRefractMutationOptions = Apollo.BaseMutationOptions<PatchRefractMutation, PatchRefractMutationVariables>;
export const CreateRefractDocument = gql`
    mutation createRefract($name: String!, $archetype: Archetype!, $remotes: [ID!]!) {
  createRefraction(input: {name: $name, archetype: $archetype, remotes: $remotes}) {
    id
  }
}
    `;
export type CreateRefractMutationFn = Apollo.MutationFunction<CreateRefractMutation, CreateRefractMutationVariables>;

/**
 * __useCreateRefractMutation__
 *
 * To run a mutation, you first call `useCreateRefractMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateRefractMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createRefractMutation, { data, loading, error }] = useCreateRefractMutation({
 *   variables: {
 *      name: // value for 'name'
 *      archetype: // value for 'archetype'
 *      remotes: // value for 'remotes'
 *   },
 * });
 */
export function useCreateRefractMutation(baseOptions?: Apollo.MutationHookOptions<CreateRefractMutation, CreateRefractMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateRefractMutation, CreateRefractMutationVariables>(CreateRefractDocument, options);
      }
export type CreateRefractMutationHookResult = ReturnType<typeof useCreateRefractMutation>;
export type CreateRefractMutationResult = Apollo.MutationResult<CreateRefractMutation>;
export type CreateRefractMutationOptions = Apollo.BaseMutationOptions<CreateRefractMutation, CreateRefractMutationVariables>;
export const GetRefractionDocument = gql`
    query getRefraction($id: ID!) {
  getRefraction(id: $id) {
    id
    createdAt
    updatedAt
    name
    archetype
    remotes {
      id
      name
    }
  }
}
    `;

/**
 * __useGetRefractionQuery__
 *
 * To run a query within a React component, call `useGetRefractionQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetRefractionQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetRefractionQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetRefractionQuery(baseOptions: Apollo.QueryHookOptions<GetRefractionQuery, GetRefractionQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetRefractionQuery, GetRefractionQueryVariables>(GetRefractionDocument, options);
      }
export function useGetRefractionLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetRefractionQuery, GetRefractionQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetRefractionQuery, GetRefractionQueryVariables>(GetRefractionDocument, options);
        }
export type GetRefractionQueryHookResult = ReturnType<typeof useGetRefractionQuery>;
export type GetRefractionLazyQueryHookResult = ReturnType<typeof useGetRefractionLazyQuery>;
export type GetRefractionQueryResult = Apollo.QueryResult<GetRefractionQuery, GetRefractionQueryVariables>;
export const ListRefractionsDocument = gql`
    query listRefractions {
  listRefractions {
    id
    createdAt
    updatedAt
    name
    archetype
  }
}
    `;

/**
 * __useListRefractionsQuery__
 *
 * To run a query within a React component, call `useListRefractionsQuery` and pass it any options that fit your needs.
 * When your component renders, `useListRefractionsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useListRefractionsQuery({
 *   variables: {
 *   },
 * });
 */
export function useListRefractionsQuery(baseOptions?: Apollo.QueryHookOptions<ListRefractionsQuery, ListRefractionsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ListRefractionsQuery, ListRefractionsQueryVariables>(ListRefractionsDocument, options);
      }
export function useListRefractionsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ListRefractionsQuery, ListRefractionsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ListRefractionsQuery, ListRefractionsQueryVariables>(ListRefractionsDocument, options);
        }
export type ListRefractionsQueryHookResult = ReturnType<typeof useListRefractionsQuery>;
export type ListRefractionsLazyQueryHookResult = ReturnType<typeof useListRefractionsLazyQuery>;
export type ListRefractionsQueryResult = Apollo.QueryResult<ListRefractionsQuery, ListRefractionsQueryVariables>;
export const RefSelectDocument = gql`
    query refSelect {
  listRefractions {
    id
    name
  }
}
    `;

/**
 * __useRefSelectQuery__
 *
 * To run a query within a React component, call `useRefSelectQuery` and pass it any options that fit your needs.
 * When your component renders, `useRefSelectQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useRefSelectQuery({
 *   variables: {
 *   },
 * });
 */
export function useRefSelectQuery(baseOptions?: Apollo.QueryHookOptions<RefSelectQuery, RefSelectQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<RefSelectQuery, RefSelectQueryVariables>(RefSelectDocument, options);
      }
export function useRefSelectLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<RefSelectQuery, RefSelectQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<RefSelectQuery, RefSelectQueryVariables>(RefSelectDocument, options);
        }
export type RefSelectQueryHookResult = ReturnType<typeof useRefSelectQuery>;
export type RefSelectLazyQueryHookResult = ReturnType<typeof useRefSelectLazyQuery>;
export type RefSelectQueryResult = Apollo.QueryResult<RefSelectQuery, RefSelectQueryVariables>;
export const CreateRemoteDocument = gql`
    mutation createRemote($name: String!, $uri: String!, $archetype: Archetype!, $transport: ID!) {
  createRemote(
    input: {name: $name, uri: $uri, archetype: $archetype, transport: $transport, authMode: NONE}
  ) {
    id
  }
}
    `;
export type CreateRemoteMutationFn = Apollo.MutationFunction<CreateRemoteMutation, CreateRemoteMutationVariables>;

/**
 * __useCreateRemoteMutation__
 *
 * To run a mutation, you first call `useCreateRemoteMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateRemoteMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createRemoteMutation, { data, loading, error }] = useCreateRemoteMutation({
 *   variables: {
 *      name: // value for 'name'
 *      uri: // value for 'uri'
 *      archetype: // value for 'archetype'
 *      transport: // value for 'transport'
 *   },
 * });
 */
export function useCreateRemoteMutation(baseOptions?: Apollo.MutationHookOptions<CreateRemoteMutation, CreateRemoteMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateRemoteMutation, CreateRemoteMutationVariables>(CreateRemoteDocument, options);
      }
export type CreateRemoteMutationHookResult = ReturnType<typeof useCreateRemoteMutation>;
export type CreateRemoteMutationResult = Apollo.MutationResult<CreateRemoteMutation>;
export type CreateRemoteMutationOptions = Apollo.BaseMutationOptions<CreateRemoteMutation, CreateRemoteMutationVariables>;
export const PatchRemoteDocument = gql`
    mutation patchRemote($id: ID!, $transportID: ID!, $allowed: [String!]!, $blocked: [String!]!, $authHeaders: [String!]!, $directHeader: String!, $directToken: String!, $authMode: AuthMode!) {
  patchRemote(
    id: $id
    input: {transportID: $transportID, allowed: $allowed, blocked: $blocked, authHeaders: $authHeaders, directHeader: $directHeader, directToken: $directToken, authMode: $authMode}
  ) {
    id
  }
}
    `;
export type PatchRemoteMutationFn = Apollo.MutationFunction<PatchRemoteMutation, PatchRemoteMutationVariables>;

/**
 * __usePatchRemoteMutation__
 *
 * To run a mutation, you first call `usePatchRemoteMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `usePatchRemoteMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [patchRemoteMutation, { data, loading, error }] = usePatchRemoteMutation({
 *   variables: {
 *      id: // value for 'id'
 *      transportID: // value for 'transportID'
 *      allowed: // value for 'allowed'
 *      blocked: // value for 'blocked'
 *      authHeaders: // value for 'authHeaders'
 *      directHeader: // value for 'directHeader'
 *      directToken: // value for 'directToken'
 *      authMode: // value for 'authMode'
 *   },
 * });
 */
export function usePatchRemoteMutation(baseOptions?: Apollo.MutationHookOptions<PatchRemoteMutation, PatchRemoteMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<PatchRemoteMutation, PatchRemoteMutationVariables>(PatchRemoteDocument, options);
      }
export type PatchRemoteMutationHookResult = ReturnType<typeof usePatchRemoteMutation>;
export type PatchRemoteMutationResult = Apollo.MutationResult<PatchRemoteMutation>;
export type PatchRemoteMutationOptions = Apollo.BaseMutationOptions<PatchRemoteMutation, PatchRemoteMutationVariables>;
export const GetRemoteDocument = gql`
    query getRemote($id: ID!) {
  getRemote(id: $id) {
    id
    createdAt
    updatedAt
    name
    uri
    archetype
    enabled
    security {
      id
      allowed
      blocked
      authMode
      directHeader
      directToken
      authHeaders
    }
    transport {
      id
      name
      cert
      key
      ca
      skipTLSVerify
      httpProxy
      httpsProxy
      noProxy
    }
  }
}
    `;

/**
 * __useGetRemoteQuery__
 *
 * To run a query within a React component, call `useGetRemoteQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetRemoteQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetRemoteQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetRemoteQuery(baseOptions: Apollo.QueryHookOptions<GetRemoteQuery, GetRemoteQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetRemoteQuery, GetRemoteQueryVariables>(GetRemoteDocument, options);
      }
export function useGetRemoteLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetRemoteQuery, GetRemoteQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetRemoteQuery, GetRemoteQueryVariables>(GetRemoteDocument, options);
        }
export type GetRemoteQueryHookResult = ReturnType<typeof useGetRemoteQuery>;
export type GetRemoteLazyQueryHookResult = ReturnType<typeof useGetRemoteLazyQuery>;
export type GetRemoteQueryResult = Apollo.QueryResult<GetRemoteQuery, GetRemoteQueryVariables>;
export const ListRemotesDocument = gql`
    query listRemotes($arch: String!) {
  listRemotes(arch: $arch) {
    id
    name
    updatedAt
    createdAt
    uri
    enabled
    archetype
  }
}
    `;

/**
 * __useListRemotesQuery__
 *
 * To run a query within a React component, call `useListRemotesQuery` and pass it any options that fit your needs.
 * When your component renders, `useListRemotesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useListRemotesQuery({
 *   variables: {
 *      arch: // value for 'arch'
 *   },
 * });
 */
export function useListRemotesQuery(baseOptions: Apollo.QueryHookOptions<ListRemotesQuery, ListRemotesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ListRemotesQuery, ListRemotesQueryVariables>(ListRemotesDocument, options);
      }
export function useListRemotesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ListRemotesQuery, ListRemotesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ListRemotesQuery, ListRemotesQueryVariables>(ListRemotesDocument, options);
        }
export type ListRemotesQueryHookResult = ReturnType<typeof useListRemotesQuery>;
export type ListRemotesLazyQueryHookResult = ReturnType<typeof useListRemotesLazyQuery>;
export type ListRemotesQueryResult = Apollo.QueryResult<ListRemotesQuery, ListRemotesQueryVariables>;
export const CreateTransportDocument = gql`
    mutation createTransport($name: String!, $ca: String!, $cert: String!, $key: String!, $skipTLSVerify: Boolean!, $httpProxy: String!, $httpsProxy: String!, $noProxy: String!) {
  createTransportProfile(
    input: {name: $name, ca: $ca, cert: $cert, key: $key, skipTLSVerify: $skipTLSVerify, httpProxy: $httpProxy, httpsProxy: $httpsProxy, noProxy: $noProxy}
  ) {
    id
  }
}
    `;
export type CreateTransportMutationFn = Apollo.MutationFunction<CreateTransportMutation, CreateTransportMutationVariables>;

/**
 * __useCreateTransportMutation__
 *
 * To run a mutation, you first call `useCreateTransportMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateTransportMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createTransportMutation, { data, loading, error }] = useCreateTransportMutation({
 *   variables: {
 *      name: // value for 'name'
 *      ca: // value for 'ca'
 *      cert: // value for 'cert'
 *      key: // value for 'key'
 *      skipTLSVerify: // value for 'skipTLSVerify'
 *      httpProxy: // value for 'httpProxy'
 *      httpsProxy: // value for 'httpsProxy'
 *      noProxy: // value for 'noProxy'
 *   },
 * });
 */
export function useCreateTransportMutation(baseOptions?: Apollo.MutationHookOptions<CreateTransportMutation, CreateTransportMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateTransportMutation, CreateTransportMutationVariables>(CreateTransportDocument, options);
      }
export type CreateTransportMutationHookResult = ReturnType<typeof useCreateTransportMutation>;
export type CreateTransportMutationResult = Apollo.MutationResult<CreateTransportMutation>;
export type CreateTransportMutationOptions = Apollo.BaseMutationOptions<CreateTransportMutation, CreateTransportMutationVariables>;
export const ListTransportsDocument = gql`
    query listTransports {
  listTransports {
    id
    name
    skipTLSVerify
    ca
    cert
    noProxy
    httpProxy
    httpsProxy
  }
}
    `;

/**
 * __useListTransportsQuery__
 *
 * To run a query within a React component, call `useListTransportsQuery` and pass it any options that fit your needs.
 * When your component renders, `useListTransportsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useListTransportsQuery({
 *   variables: {
 *   },
 * });
 */
export function useListTransportsQuery(baseOptions?: Apollo.QueryHookOptions<ListTransportsQuery, ListTransportsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ListTransportsQuery, ListTransportsQueryVariables>(ListTransportsDocument, options);
      }
export function useListTransportsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ListTransportsQuery, ListTransportsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ListTransportsQuery, ListTransportsQueryVariables>(ListTransportsDocument, options);
        }
export type ListTransportsQueryHookResult = ReturnType<typeof useListTransportsQuery>;
export type ListTransportsLazyQueryHookResult = ReturnType<typeof useListTransportsLazyQuery>;
export type ListTransportsQueryResult = Apollo.QueryResult<ListTransportsQuery, ListTransportsQueryVariables>;

      export interface PossibleTypesResultData {
        possibleTypes: {
          [key: string]: string[]
        }
      }
      const result: PossibleTypesResultData = {
  "possibleTypes": {}
};
      export default result;
    