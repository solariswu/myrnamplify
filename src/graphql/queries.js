/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getMycounter = /* GraphQL */ `
  query GetMycounter($id: ID!) {
    getMycounter(id: $id) {
      id
      value
      createdAt
      updatedAt
    }
  }
`;
export const listMycounters = /* GraphQL */ `
  query ListMycounters(
    $filter: ModelMycounterFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listMycounters(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        value
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;
