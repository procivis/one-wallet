import { expect } from 'detox';

import {
  credentialIssuance,
  offerCredentialAndReviewCredentialOfferScreen,
} from '../../helpers/credential';
import { getCredentialSchemaData } from '../../helpers/credentialSchemas';
import {
  waitForElementIsNotPresent,
  waitForElementToHaveText,
  waitForElementVisible,
} from '../../page-objects/components/ElementUtil';
import RemoteSecureElementChangePinScreen from '../../page-objects/credential/rse/RemoteSecureElementChangePinScreen';
import RemoteSecureElementSignScreen from '../../page-objects/credential/rse/RemoteSecureElementSignScreen';
import CredentialAcceptProcessScreen from '../../page-objects/CredentialAcceptProcessScreen';
import CredentialOfferScreen from '../../page-objects/CredentialOfferScreen';
import DeleteWalletProcessScreen from '../../page-objects/settings/DeleteWalletProcessScreen';
import DeleteWalletScreen from '../../page-objects/settings/DeleteWalletScreen';
import SettingsScreen, {
  SettingsButton,
} from '../../page-objects/SettingsScreen';
import WalletScreen from '../../page-objects/WalletScreen';
import { CredentialSchemaResponseDTO } from '../../types/credential';
import { bffLogin, createCredentialSchema } from '../../utils/bff-api';
import {
  CredentialFormat,
  IssuanceProtocol,
  RevocationMethod,
  WalletKeyStorageType,
} from '../../utils/enums';
import {
  launchApp,
  LONG_WAIT_TIME,
  moveToDashboardScreenFromOnboardingScreen,
  RSEConfig,
  SHORT_WAIT_TIME,
} from '../../utils/init';

describe('RSE Remote PIN Code', () => {
  let authToken: string;
  let credentialSchemaRSE_JWT: CredentialSchemaResponseDTO;
  let globalRSEConfig: RSEConfig;
  beforeAll(async () => {
    authToken = await bffLogin();
    await launchApp();
    credentialSchemaRSE_JWT = await createCredentialSchema(
      authToken,
      getCredentialSchemaData({
        format: CredentialFormat.JWT,
        revocationMethod: RevocationMethod.STATUSLIST2021,
        walletStorageType: WalletKeyStorageType.REMOTE_SECURE_ELEMENT,
      }),
    );
    globalRSEConfig = { PINCode: '12345', isRSEOnboarded: false };
  });

  beforeEach(async () => {
    if (!globalRSEConfig.isRSEOnboarded) {
      await credentialIssuance({
        authToken: authToken,
        credentialSchema: credentialSchemaRSE_JWT,
        exchange: IssuanceProtocol.OPENID4VCI_DRAFT13,
        rseConfig: globalRSEConfig,
      });
      globalRSEConfig.isRSEOnboarded = true;
    }
    await WalletScreen.settingsButton.tap();
  });

  it('Change Remote PIN Code - with RSE onboarding', async () => {
    await SettingsScreen.scrollTo(SettingsButton.CHANGE_REMOTE_PIN);
    await SettingsScreen.button(SettingsButton.CHANGE_REMOTE_PIN).tap();

    await waitForElementVisible(
      RemoteSecureElementChangePinScreen.screen,
      SHORT_WAIT_TIME,
      1,
    );

    await RemoteSecureElementChangePinScreen.fillRemotePINCode(
      globalRSEConfig.PINCode,
    );

    await waitForElementToHaveText(
      RemoteSecureElementChangePinScreen.title,
      'New Remote PIN Code',
      SHORT_WAIT_TIME,
    );

    const newPINCode = '56789';
    await RemoteSecureElementChangePinScreen.fillRemotePINCode(newPINCode);

    await waitForElementToHaveText(
      RemoteSecureElementChangePinScreen.title,
      'Confirm Remote PIN Code',
      SHORT_WAIT_TIME,
    );
    await RemoteSecureElementChangePinScreen.fillRemotePINCode(newPINCode);

    await waitForElementIsNotPresent(
      RemoteSecureElementChangePinScreen.screen,
      SHORT_WAIT_TIME,
    );

    await offerCredentialAndReviewCredentialOfferScreen({
      authToken: authToken,
      credentialSchema: credentialSchemaRSE_JWT,
      exchange: IssuanceProtocol.OPENID4VCI_DRAFT13,
      rseConfig: { PINCode: globalRSEConfig.PINCode, isRSEOnboarded: false },
    });

    await device.disableSynchronization();
    await CredentialOfferScreen.credentialCard.verifyIsVisible();

    await CredentialOfferScreen.scrollTo(CredentialOfferScreen.acceptButton);

    await CredentialOfferScreen.acceptButton.tap();

    await waitForElementVisible(
      CredentialAcceptProcessScreen.screen,
      LONG_WAIT_TIME,
    );
    await waitForElementVisible(
      RemoteSecureElementSignScreen.screen,
      LONG_WAIT_TIME,
      1,
    );
    await RemoteSecureElementSignScreen.waitForScreenDisplayedAndFillPINCode(
      globalRSEConfig.PINCode,
    );

    await waitForElementToHaveText(
      RemoteSecureElementSignScreen.error,
      `Wrong PIN entered (4 attempts left)`,
      SHORT_WAIT_TIME,
    );
    await RemoteSecureElementSignScreen.waitForScreenDisplayedAndFillPINCode(
      newPINCode,
    );

    await waitForElementVisible(
      CredentialAcceptProcessScreen.status.success,
      LONG_WAIT_TIME,
    );
    await CredentialAcceptProcessScreen.button.close.tap();
    await expect(WalletScreen.screen).toBeVisible(1);
    await device.enableSynchronization();
    globalRSEConfig.PINCode = newPINCode;
  });

  it('Cancel Change Remote PIN Code Process - with RSE onboarding', async () => {
    await SettingsScreen.scrollTo(SettingsButton.CHANGE_REMOTE_PIN);
    await SettingsScreen.button(SettingsButton.CHANGE_REMOTE_PIN).tap();

    await waitForElementVisible(
      RemoteSecureElementChangePinScreen.screen,
      SHORT_WAIT_TIME,
      1,
    );

    await RemoteSecureElementChangePinScreen.fillRemotePINCode(
      globalRSEConfig.PINCode,
    );

    await waitForElementToHaveText(
      RemoteSecureElementChangePinScreen.title,
      'New Remote PIN Code',
      SHORT_WAIT_TIME,
    );

    await RemoteSecureElementChangePinScreen.close.tap();

    await credentialIssuance({
      authToken: authToken,
      credentialSchema: credentialSchemaRSE_JWT,
      exchange: IssuanceProtocol.OPENID4VCI_DRAFT13,
      rseConfig: globalRSEConfig,
    });
  });

  it('Delete Wallet - with RSE onboarding', async () => {
    await SettingsScreen.scrollTo(SettingsButton.DELETE_WALLET);
    await SettingsScreen.button(SettingsButton.DELETE_WALLET).tap();
    await expect(DeleteWalletScreen.screen).toBeVisible(1);

    await DeleteWalletScreen.checkbox.tap();
    await DeleteWalletScreen.deleteButton.longPress(3500);

    await waitForElementVisible(
      DeleteWalletProcessScreen.status.success,
      LONG_WAIT_TIME,
    );

    await DeleteWalletProcessScreen.closeButton.tap();

    await moveToDashboardScreenFromOnboardingScreen();
  });
});
