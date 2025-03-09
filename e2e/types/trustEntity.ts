import { TrustEntityRole } from '../utils/enums';
import { DidDetailDTO } from './did';

export interface TrustEntityResponseDTO {
  createdDate: string;
  did: DidDetailDTO;
  id: string;
  lastModified: string;
  logo?: string | null;
  name: string;
  privacyUrl?: string | null;
  role: TrustEntityRole;
  state: string;
  termsUrl?: string | null;
  website?: string | null;
}
