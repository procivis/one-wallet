import { expect } from 'detox';

import { TrustEntityResponseDTO } from '../../utils/bff-api';
import { isElementVisible } from './ElementUtil';
import EntityDetailHeader from './TrustEntityHeader';

export default function TrustEntityDetail(screenTestID: string) {
  return {
    async verifyTrustEntityDetail(trustEntity: TrustEntityResponseDTO) {
      await EntityDetailHeader(screenTestID).verifyEntityDetailHeader(
        trustEntity,
      );
      await expect(element(by.id(`${screenTestID}.subline`))).toBeVisible();
      if (trustEntity.website) {
        await expect(element(by.text(`Visit official website`))).toBeVisible();
      }
      if (trustEntity.termsUrl) {
        await expect(element(by.text(`Terms of service`))).toBeVisible();
      }
      if (trustEntity.privacyUrl) {
        await expect(element(by.text(`Privacy policy`))).toBeVisible();
      }
      await expect(element(by.id('trustRegistry.attributeValue'))).toHaveText(
        'Dev Trust List',
      );
      if (await isElementVisible('issuerDID.expandValueButton')) {
        await element(by.id(`issuerDID.expandValueButton`)).tap();
      }
      await expect(element(by.id('issuerDID.attributeValue'))).toHaveText(
        trustEntity.did.did,
      );
      await expect(element(by.id('role.attributeValue'))).toHaveText(
        trustEntity.role,
      );
    },

    async verifyTrustEntityDetailDefault(didValue: string) {
      await EntityDetailHeader(screenTestID).verifyEntityDetailHeaderDefault(
        didValue,
      );
    },
  };
}
