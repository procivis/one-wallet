import { expect } from 'detox';

import { TrustEntityResponseDTO } from '../../types/trustEntity';
import { isElementVisible } from '../components/ElementUtil';

export default function TrustEntityDetail(testID: string) {
  const linkTestId = `${testID}.links`;
  const attributesTestId = `${testID}.attributes`;
  return {
    async verifyButtons(trustEntity: TrustEntityResponseDTO) {
      if (trustEntity.website) {
        await expect(element(by.id(`${linkTestId}.website`))).toBeVisible();
      }
      if (trustEntity.termsUrl) {
        await expect(element(by.id(`${linkTestId}.termsOfService`))).toBeVisible();
      }
      if (trustEntity.privacyUrl) {
        await expect(element(by.id(`${linkTestId}.privacyPolicy`))).toBeVisible();
      }
    },
    async verifyTrustEntityDetail(trustEntity: TrustEntityResponseDTO) {
      await this.verifyButtons(trustEntity);
      await this.verifyTrustRegistryDetail(trustEntity);
    },
    async verifyTrustRegistryDetail(trustEntity: TrustEntityResponseDTO) {
       await expect(element(by.id(`${attributesTestId}.trustRegistry.attributeValue`))).toHaveText(
        'Dev Trust List',
      );
      if (await isElementVisible(`${attributesTestId}.issuerDID.expandValueButton`)) {
        await element(by.id(`${attributesTestId}.issuerDID.expandValueButton`)).tap();
      }
      await expect(element(by.id(`${attributesTestId}.issuerDID.attributeValue`))).toHaveText(
        trustEntity.did.did,
      );
      await expect(element(by.id(`${attributesTestId}.role.attributeValue`))).toHaveText(
        trustEntity.role,
      );
    },
  };
}
