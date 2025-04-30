import {
  createTrustEntity,
  getTrustAnchor,
  getTrustEntityDetail,
} from '../utils/api';
import { getTrustEntityRequestData } from '../utils/data-utils';
import { TrustEntityRole } from '../utils/enums';

export const createTrustEntityWithDefaultAnchor = async (
  authToken: string,
  didID: string,
  entityRole: TrustEntityRole = TrustEntityRole.BOTH,
) => {
  const trustAnchor = await getTrustAnchor(authToken);
  const issuerTrustEntityId = await createTrustEntity(
    authToken,
    getTrustEntityRequestData(
      didID,
      trustAnchor.id,
      entityRole,
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==',
      'https://www.procivis.ch/en/privacy-policy',
      'https://www.procivis.ch/en/legal/terms-of-service-procivis-one-trial-environment',
      'https://www.procivis.ch/en',
    ),
  );
  return getTrustEntityDetail(issuerTrustEntityId, authToken);
};
