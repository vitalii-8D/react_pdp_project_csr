import { gqlRequest } from '../graphql-client';
import type { UploadPurpose } from '../../enums/upload-purpose.enum';
import type { PresignedUploadPayload } from '../types';

export interface GenerateUploadUrlInput {
  purpose: UploadPurpose;
  fileName: string;
  contentType: string;
}

const GENERATE_UPLOAD_URL_MUTATION = /* GraphQL */ `
  mutation GenerateUploadUrl($input: GenerateUploadUrlInput!) {
    generateUploadUrl(input: $input) {
      uploadUrl
      publicUrl
      key
    }
  }
`;

export async function generateUploadUrlMutation(
  token: string,
  input: GenerateUploadUrlInput,
): Promise<PresignedUploadPayload> {
  const data = await gqlRequest<{ generateUploadUrl: PresignedUploadPayload }>(
    GENERATE_UPLOAD_URL_MUTATION,
    { input },
    token,
  );
  return data.generateUploadUrl;
}
