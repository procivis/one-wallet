import { DataType } from '../utils/enums';
import { CredentialClaimSchemaResponseDTO } from './credential';
import { CredentialDetailCredSchemaDTO } from './credentialSchema';

export interface ProofSchemaResponseClaimDTO {
  createdDate: string;
  credentialSchema: CredentialDetailCredSchemaDTO;
  datatype: DataType;
  id: string;
  key: string;
  lastModified: string;
  required: boolean;
}

export interface ProofSchemaListResponseDTO {
  createdDate: string;
  id: string;
  lastModified: string;
  name: string;
}
export interface ProofCredSchemasListDTO {
  claimSchemas: ProofSchemaResponseClaimDTO[];
  credentialSchema: CredentialClaimSchemaResponseDTO;
}

export interface ProofSchemaResponseDTO extends ProofSchemaListResponseDTO {
  expireDuration: number;
  organisationId: string;
  proofInputSchemas: ProofCredSchemasListDTO[];
}
