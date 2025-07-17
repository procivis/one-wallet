import { TrustEntityType } from '@procivis/one-tests-lib';

import { TrustEntityRole } from '../utils/enums';
import { DidDetailDTO } from './did';

export interface TrustEntityResponseDTO {
  content?: string;
  createdDate: string;
  did: DidDetailDTO;
  id: string;
  lastModified: string;
  logo?: string;
  name: string;
  privacyUrl?: string;
  role: TrustEntityRole;
  state: string;
  termsUrl?: string;
  type: TrustEntityType;
  website?: string;
}
