/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const createMycounter = /* GraphQL */ `
  mutation CreateMycounter(
    $input: CreateMycounterInput!
    $condition: ModelMycounterConditionInput
  ) {
    createMycounter(input: $input, condition: $condition) {
      id
      value
      createdAt
      updatedAt
    }
  }
`;
export const updateMycounter = /* GraphQL */ `
  mutation UpdateMycounter(
    $input: UpdateMycounterInput!
    $condition: ModelMycounterConditionInput
  ) {
    updateMycounter(input: $input, condition: $condition) {
      id
      value
      createdAt
      updatedAt
    }
  }
`;
export const deleteMycounter = /* GraphQL */ `
  mutation DeleteMycounter(
    $input: DeleteMycounterInput!
    $condition: ModelMycounterConditionInput
  ) {
    deleteMycounter(input: $input, condition: $condition) {
      id
      value
      createdAt
      updatedAt
    }
  }
`;
