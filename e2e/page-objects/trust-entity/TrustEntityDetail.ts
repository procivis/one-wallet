import { expect } from 'detox';

import { TrustEntityResponseDTO } from '../../types/trustEntity';
import { isElementVisible } from '../components/ElementUtil';

export default class TrustEntityDetail {
  constructor(private testID: string) {}

  async verifyButtons(trustEntity: TrustEntityResponseDTO) {
    if (trustEntity.website) {
      await expect(
        element(by.id(`${this.testID}.links.website`)),
      ).toBeVisible();
    }
    if (trustEntity.termsUrl) {
      await expect(
        element(by.id(`${this.testID}.links.termsOfService`)),
      ).toBeVisible();
    }
    if (trustEntity.privacyUrl) {
      await expect(
        element(by.id(`${this.testID}.links.privacyPolicy`)),
      ).toBeVisible();
    }
  }

  async verifyTrustEntityDetail(trustEntity: TrustEntityResponseDTO) {
    await this.verifyButtons(trustEntity);
    await this.verifyTrustRegistryDetail(trustEntity);
  }

  async verifyTrustRegistryDetail(trustEntity: TrustEntityResponseDTO) {
    await expect(element(by.id(`trustRegistry.attributeValue`))).toHaveText(
      'Dev Trust List',
    );
    if (await isElementVisible(`issuerDID.expandValueButton`)) {
      await element(by.id(`issuerDID.expandValueButton`)).tap();
    }
    await expect(element(by.id(`issuerDID.attributeValue`))).toHaveText(
      trustEntity.did.did,
    );
    await expect(element(by.id(`role.attributeValue`))).toHaveText(
      trustEntity.role,
    );
  }
}
