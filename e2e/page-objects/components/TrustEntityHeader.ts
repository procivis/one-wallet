import { expect } from 'detox';

import { TrustEntityResponseDTO } from '../../types/trustEntity';

export default function EntityDetailHeader(screenTestID: string) {
  return {
    async verifyEntityDetailHeader(trustEntity: TrustEntityResponseDTO) {
      if (trustEntity.logo) {
        await expect(
          element(by.id(`${screenTestID}.avatar.logo`)),
        ).toBeVisible();
      }
      await waitFor(element(by.id(`${screenTestID}.statusIcon.trusted`)))
        .toBeVisible()
        .withTimeout(10000);
      await expect(element(by.id(`${screenTestID}.entityName`))).toHaveText(
        trustEntity.name,
      );
    },

    async verifyEntityDetailHeaderDefault(didValue: string) {
      await expect(element(by.id(`${screenTestID}.entityName`))).toBeVisible();
      await expect(element(by.id(`${screenTestID}.subline`))).toHaveText(
        didValue.replace(/-/g, '\u2011'),
      );
    },
  };
}
