import { expect } from 'detox';

import { getAttributeClaims } from '../../helpers/claims';
import { credentialIssuance } from '../../helpers/credential';
import { getCredentialSchemaData } from '../../helpers/credentialSchemas';
import { CredentialStatus } from '../../page-objects/components/CredentialCard';
import { waitForElementVisible } from '../../page-objects/components/ElementUtil';
import { HistoryEntryEnum } from '../../page-objects/components/HistoryEntryList';
import CredentialDetailScreen, {
  Action,
} from '../../page-objects/credential/CredentialDetailScreen';
import CredentialHistoryScreen from '../../page-objects/credential/CredentialHistoryScreen';
import CredentialDeleteProcessScreen from '../../page-objects/CredentialDeleteProcessScreen';
import CredentialDeletePromptScreen from '../../page-objects/CredentialDeletePromptScreen';
import HistoryDetailScreen, { CredentialCardStatus } from '../../page-objects/HistoryDetailScreen';
import HistoryScreen from '../../page-objects/HistoryScreen';
import SettingsScreen, {
  SettingsButton,
} from '../../page-objects/SettingsScreen';
import StatusCheckResultScreen from '../../page-objects/StatusCheckResultScreen';
import WalletScreen from '../../page-objects/WalletScreen';
import { CredentialSchemaResponseDTO } from '../../types/credential';
import { DidDetailDTO } from '../../types/did';
import {
  createCredentialSchema,
  getDidDetail,
  getLocalDid,
  keycloakAuth,
  revalidateCredential,
  revokeCredential,
  suspendCredential,
} from '../../utils/api';
import {
  CredentialFormat,
  DidMethod,
  IssuanceProtocol,
  KeyType,
  RevocationMethod,
} from '../../utils/enums';
import {
  DEFAULT_WAIT_TIME,
  launchApp,
  SHORT_WAIT_TIME,
} from '../../utils/init';
import { statusScreenCheck } from '../../utils/status-check';

const refreshCredentialAndUpdateCredentialStatus = async (
  credentialStatus: CredentialStatus,
) => {
  await CredentialDetailScreen.screen.waitForScreenVisible();
  await CredentialDetailScreen.actionButton.tap();
  await CredentialDetailScreen.action(Action.REFRESH_CREDENTIAL).tap();
  await waitForElementVisible(
    StatusCheckResultScreen.screen,
    DEFAULT_WAIT_TIME,
    1,
  );
  await statusScreenCheck([{ index: 0, status: credentialStatus }]);
  await StatusCheckResultScreen.closeButton.tap();
};

const accessHistoryDetailNerdMode = async () => {
  await HistoryDetailScreen.infoButton.tap();
  await waitForElementVisible(
    element(by.id(/^.*.closeIcon+$/)),
    SHORT_WAIT_TIME,
  );
  await element(by.id(/^.*.closeIcon+$/)).tap();
  await expect(HistoryDetailScreen.screen).toBeVisible(1);
};

describe('ONE-4692: Wallet: Adjusted display of history (Credentials)', () => {
  let authToken: string;
  let schema: CredentialSchemaResponseDTO;
  let issuerDid: DidDetailDTO;
  beforeAll(async () => {
    authToken = await keycloakAuth();
    await launchApp({ delete: true });
    const schemaData = getCredentialSchemaData({
      allowSuspension: true,
      claims: getAttributeClaims(),
      format: CredentialFormat.SD_JWT,
      layoutProperties: {
        primaryAttribute: 'Attribute 1',
      },
      revocationMethod: RevocationMethod.LVVC,
    });
    schema = await createCredentialSchema(authToken, schemaData);
    const didListItemDTO = await getLocalDid(authToken, {
      didMethods: DidMethod.WEB,
      keyAlgorithms: KeyType.ECDSA,
    });
    issuerDid = await getDidDetail(authToken, didListItemDTO.id);
  });

  it('Test credential history list for pending credential, accepted credential, suspended credential, revalidated credential and revoked credential', async () => {
    const issuerHolderCredentialIds = await credentialIssuance({
      authToken: authToken,
      credentialSchema: schema,
      didData: issuerDid,
      exchange: IssuanceProtocol.OPENID4VCI_DRAFT13,
    });
    const credentialId = issuerHolderCredentialIds.issuerCredentialId;

    const card_0 = await WalletScreen.credentialAtIndex(0);
    await card_0.openDetail();
    let historyLabelsUnderCredentialDetail = [
      HistoryEntryEnum.CREDENTIAL_ACCEPTED,
      HistoryEntryEnum.CREDENTIAL_PENDING,
    ];
    await CredentialDetailScreen.historyEntryList.verifyHistoryLabels(
      historyLabelsUnderCredentialDetail,
    );

    await suspendCredential(credentialId, authToken);

    await refreshCredentialAndUpdateCredentialStatus(
      CredentialStatus.SUSPENDED,
    );

    historyLabelsUnderCredentialDetail = [
      HistoryEntryEnum.CREDENTIAL_SUSPENDED,
      HistoryEntryEnum.CREDENTIAL_ACCEPTED,
    ];
    await CredentialDetailScreen.historyEntryList.verifyHistoryLabels(
      historyLabelsUnderCredentialDetail,
    );

    await revalidateCredential(credentialId, authToken);

    await refreshCredentialAndUpdateCredentialStatus(
      CredentialStatus.REVALIDATED,
    );

    historyLabelsUnderCredentialDetail = [
      HistoryEntryEnum.CREDENTIAL_REACTIVATED,
      HistoryEntryEnum.CREDENTIAL_ACCEPTED,
      HistoryEntryEnum.CREDENTIAL_SUSPENDED,
    ];
    await CredentialDetailScreen.historyEntryList.verifyHistoryLabels(
      historyLabelsUnderCredentialDetail,
    );

    await revokeCredential(credentialId, authToken);

    await refreshCredentialAndUpdateCredentialStatus(CredentialStatus.REVOKED);

    await CredentialDetailScreen.screen.waitForScreenVisible();
    historyLabelsUnderCredentialDetail = [
      HistoryEntryEnum.CREDENTIAL_REVOKED,
      HistoryEntryEnum.CREDENTIAL_REACTIVATED,
      HistoryEntryEnum.CREDENTIAL_ACCEPTED,
    ];
    await CredentialDetailScreen.historyEntryList.verifyHistoryLabels(
      historyLabelsUnderCredentialDetail,
    );

    await CredentialDetailScreen.openCredentialHistoryScreen();
    await expect(CredentialHistoryScreen.screen).toBeVisible(1);
    const historyLabels = [
      HistoryEntryEnum.CREDENTIAL_REVOKED,
      HistoryEntryEnum.CREDENTIAL_REACTIVATED,
      HistoryEntryEnum.CREDENTIAL_ACCEPTED,
      HistoryEntryEnum.CREDENTIAL_SUSPENDED,
      HistoryEntryEnum.CREDENTIAL_ACCEPTED,
      HistoryEntryEnum.CREDENTIAL_PENDING,
    ];

    await CredentialHistoryScreen.historyEntryList.verifyHistoryLabels(
      historyLabels,
    );
    await CredentialHistoryScreen.backButton.tap();
    await CredentialDetailScreen.screen.waitForScreenVisible(SHORT_WAIT_TIME);
    await CredentialDetailScreen.backButton.tap();
    await expect(WalletScreen.screen).toBeVisible(1);
    await WalletScreen.settingsButton.tap();
    await expect(SettingsScreen.screen).toBeVisible(1);
    await SettingsScreen.button(SettingsButton.HISTORY).tap();
    await expect(HistoryScreen.screen).toBeVisible(1);

    const historyEntryRows = [
      {
        info: issuerDid.did,
        label: HistoryEntryEnum.CREDENTIAL_REVOKED,
      },
      {
        info: issuerDid.did,
        label: HistoryEntryEnum.CREDENTIAL_REACTIVATED,
      },
      {
        info: issuerDid.did,
        label: HistoryEntryEnum.CREDENTIAL_ACCEPTED,
      },
      {
        info: issuerDid.did,
        label: HistoryEntryEnum.CREDENTIAL_SUSPENDED,
      },
      {
        info: issuerDid.did,
        label: HistoryEntryEnum.CREDENTIAL_ACCEPTED,
      },
      {
        info: issuerDid.did,
        label: HistoryEntryEnum.CREDENTIAL_PENDING,
      },
    ];
    await HistoryScreen.historyEntryList.verifyHistory(historyEntryRows);

    let index = 0;
    for (const historyEntry of historyEntryRows) {
      await HistoryScreen.historyEntryList.viewHistoryDetail(index);
      await HistoryDetailScreen.verifyAction(historyEntry.label);
      await HistoryDetailScreen.veifyCredentialCardStatus(
        issuerHolderCredentialIds.holderCredentialId,
        CredentialCardStatus.REVOKED,
      );
      await accessHistoryDetailNerdMode();
      await HistoryDetailScreen.back.tap();
      index++;
    }
  });

  it('Test credential history list for deleted credential', async () => {
    const issuerHolderCredentialIds = await credentialIssuance({
      authToken: authToken,
      credentialSchema: schema,
      didData: issuerDid,
      exchange: IssuanceProtocol.OPENID4VCI_DRAFT13,
    });
    const credentialCard = await WalletScreen.credentialAtIndex(0);
    await credentialCard.openDetail();
    await CredentialDetailScreen.screen.waitForScreenVisible();
    await CredentialDetailScreen.actionButton.tap();
    await CredentialDetailScreen.action(Action.DELETE_CREDENTIAL).tap();

    await device.disableSynchronization();
    await CredentialDeletePromptScreen.deleteButton.longPress(4001);
    await waitForElementVisible(
      CredentialDeleteProcessScreen.status.success,
      DEFAULT_WAIT_TIME,
    );
    await CredentialDeleteProcessScreen.closeButton.tap();
    await device.enableSynchronization();
    await expect(WalletScreen.screen).toBeVisible(1);
    await WalletScreen.settingsButton.tap();
    await expect(SettingsScreen.screen).toBeVisible(1);
    await SettingsScreen.button(SettingsButton.HISTORY).tap();
    await expect(HistoryScreen.screen).toBeVisible(1);
    await HistoryScreen.historyEntryList.verifyHistory([
      {
        info: issuerHolderCredentialIds.issuerCredentialId,
        label: HistoryEntryEnum.CREDENTIAL_DELETED,
      },
    ]);
    await HistoryScreen.historyEntryList.viewHistoryDetail(0);
    await HistoryDetailScreen.verifyAction(HistoryEntryEnum.CREDENTIAL_DELETED);
    await HistoryDetailScreen.veifyCredentialCardStatus(issuerHolderCredentialIds.holderCredentialId, CredentialCardStatus.DELETED);
    //await accessHistoryDetailNerdMode() // There is a bug https://procivis.atlassian.net/browse/ONE-5476

    await HistoryDetailScreen.back.tap();
    await HistoryScreen.historyEntryList.viewHistoryDetail(2);
    await HistoryDetailScreen.verifyAction(
      HistoryEntryEnum.CREDENTIAL_PENDING,
    );
    await HistoryDetailScreen.veifyCredentialCardStatus(
      issuerHolderCredentialIds.holderCredentialId,
      CredentialCardStatus.DELETED,
    );
    //await accessHistoryDetailNerdMode(); // There is a bug https://procivis.atlassian.net/browse/ONE-5476
    await HistoryDetailScreen.back.tap();
    await HistoryScreen.back.tap();
    await SettingsScreen.back.tap();
  });

  it('Search test', async () => {
    await credentialIssuance({
      authToken: authToken,
      credentialSchema: schema,
      didData: issuerDid,
      exchange: IssuanceProtocol.OPENID4VCI_DRAFT13,
    });
    await WalletScreen.openDetailScreen(0);
    await CredentialDetailScreen.screen.waitForScreenVisible();
    await CredentialDetailScreen.openCredentialHistoryScreen();
    await expect(CredentialHistoryScreen.screen).toBeVisible(1);
    await CredentialHistoryScreen.search.typeText('Hello');
    await expect(
      CredentialHistoryScreen.historyEntryList.historyRow(0).element,
    ).not.toBeVisible();
    await CredentialHistoryScreen.search.clearText();
  });
});
