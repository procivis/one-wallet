import { DataType, Exchange } from '../utils/enums';
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

export interface ClaimSchemaRequestDTO {
  id: string;
  required: boolean;
}

export interface ProofInputSchemasRequestDTO {
  claimSchemas: ClaimSchemaRequestDTO[];
  credentialSchemaId: string;
  validityConstraint?: number;
}

export interface CreateProofSchemaRequestDTO {
  expireDuration?: number;
  name: string;
  proofInputSchemas: ProofInputSchemasRequestDTO[];
}

export interface ProofRequestData {
  exchange: Exchange;
  proofSchemaId: string;
  redirectUri?: string;
  verifierDid: string;
  verifierKey?: string;
}
