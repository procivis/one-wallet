import { expect } from 'detox';

import { CredentialAction, credentialIssuance } from '../helpers/credential';
import { getCredentialSchemaData } from '../helpers/credentialSchemas';
import { CredentialStatus } from '../page-objects/components/CredentialCard';
import { waitForElementVisible } from '../page-objects/components/ElementUtil';
import { LoaderViewState } from '../page-objects/components/LoadingResult';
import CredentialDetailScreen, {
  Action,
} from '../page-objects/credential/CredentialDetailScreen';
import CredentialDeleteProcessScreen from '../page-objects/CredentialDeleteProcessScreen';
import CredentialDeletePromptScreen from '../page-objects/CredentialDeletePromptScreen';
import ImagePreviewScreen from '../page-objects/ImagePreviewScreen';
import InvitationErrorDetailsScreen from '../page-objects/invitation/InvitationErrorDetailsScreen';
import InvitationProcessScreen from '../page-objects/InvitationProcessScreen';
import WalletScreen from '../page-objects/WalletScreen';
import { CredentialSchemaResponseDTO } from '../types/credential';
import {
  createCredentialSchema,
  keycloakAuth,
  revokeCredential,
  suspendCredential,
} from '../utils/api';
import { formatDateTime } from '../utils/date';
import {
  CredentialFormat,
  DataType,
  DidMethod,
  IssuanceProtocol,
  KeyType,
  RevocationMethod,
  URLOption,
  WalletKeyStorageType,
} from '../utils/enums';
import { launchApp, reloadApp } from '../utils/init';
import { scanURL } from '../utils/scan';
import { shortUUID } from '../utils/utils';

describe('ONE-601: Credential issuance', () => {
  let authToken: string;
  let credentialSchemaJWT: CredentialSchemaResponseDTO;
  let credentialSchemaSD_JWT: CredentialSchemaResponseDTO;
  let credentialSchemaJWT_with_LVVC: CredentialSchemaResponseDTO;
  let credentialSchemaJSONLD: CredentialSchemaResponseDTO;

  beforeAll(async () => {
    await launchApp();

    authToken = await keycloakAuth();
    credentialSchemaJWT = await createCredentialSchema(
      authToken,
      getCredentialSchemaData({
        format: CredentialFormat.JWT,
        revocationMethod: RevocationMethod.STATUSLIST2021,
      }),
    );
    credentialSchemaSD_JWT = await createCredentialSchema(
      authToken,
      getCredentialSchemaData({
        format: CredentialFormat.SD_JWT,
        revocationMethod: RevocationMethod.STATUSLIST2021,
      }),
    );
    credentialSchemaJWT_with_LVVC = await createCredentialSchema(
      authToken,
      getCredentialSchemaData({
        allowSuspension: true,
        format: CredentialFormat.JWT,
        revocationMethod: RevocationMethod.LVVC,
      }),
    );
    credentialSchemaJSONLD = await createCredentialSchema(
      authToken,
      getCredentialSchemaData({
        format: CredentialFormat.JSON_LD_CLASSIC,
        revocationMethod: RevocationMethod.NONE,
      }),
    );
  });

  it('ONE-1800: Empty Credential dashboard', async () => {
    await expect(WalletScreen.screen).toBeVisible(1);
    await WalletScreen.verifyEmptyCredentialList();
  });

  // Pass
  describe('Credential offer', () => {
    it('Accept credential issuance', async () => {
      await credentialIssuance({
        authToken: authToken,
        credentialSchema: credentialSchemaJWT,
        exchange: IssuanceProtocol.OPENID4VCI_DRAFT13,
      });
    });

    it('Accept credential issuance with redirect URI', async () => {
      await credentialIssuance({
        authToken: authToken,
        credentialSchema: credentialSchemaJWT,
        exchange: IssuanceProtocol.OPENID4VCI_DRAFT13,
        redirectUri: 'https://www.procivis.ch',
      });
    });

    it('Reject credential issuance', async () => {
      await credentialIssuance(
        {
          authToken: authToken,
          credentialSchema: credentialSchemaJWT,
          exchange: IssuanceProtocol.OPENID4VCI_DRAFT13,
        },
        CredentialAction.REJECT,
      );
    });
  });

  // Pass
  describe('ONE-1313: LVVC; Credential revocation & Suspension', () => {
    let credentialId: string;

    beforeAll(async () => {
      await launchApp({ delete: true });
    });

    describe('Suspend credential', () => {
      beforeEach(async () => {
        const issuerHolderCredentialIds = await credentialIssuance({
          authToken: authToken,
          credentialSchema: credentialSchemaJWT_with_LVVC,
          exchange: IssuanceProtocol.OPENID4VCI_DRAFT13,
        });
        credentialId = issuerHolderCredentialIds.issuerCredentialId;
      });

      it('Suspended credential with specified date', async () => {
        await expect(
          WalletScreen.credentialName(
            credentialSchemaJWT_with_LVVC.name,
          ).atIndex(0),
        ).toBeVisible();
        const suspendedDate = new Date();
        suspendedDate.setHours(10, 0, 0, 0);
        suspendedDate.setDate(suspendedDate.getDate() + 1);
        const formattedDate = formatDateTime(suspendedDate);
        await suspendCredential(
          credentialId,
          authToken,
          suspendedDate.toISOString(),
        );

        await reloadApp({
          credentialUpdate: [
            {
              expectedLabel: `Suspended until ${formattedDate}`,
              index: 0,
              status: CredentialStatus.SUSPENDED,
            },
          ],
        });
        const card = await WalletScreen.credentialAtIndex(0);
        await card.verifyStatus(
          CredentialStatus.SUSPENDED,
          `Suspended until ${formattedDate}`,
        );
        await WalletScreen.openDetailScreen(0);

        await CredentialDetailScreen.screen.waitForScreenVisible();
        await CredentialDetailScreen.credentialCard.verifyStatus(
          CredentialStatus.SUSPENDED,
          `Suspended until ${formattedDate}`,
        );

        await expect(
          CredentialDetailScreen.historyEntryList.historyRow(0).element,
        ).toExist();
        await expect(
          CredentialDetailScreen.historyEntryList.historyRow(0).label,
        ).toHaveText('Credential suspended');
      });

      it('Suspended credential without date limits', async () => {
        await expect(
          WalletScreen.credentialName(
            credentialSchemaJWT_with_LVVC.name,
          ).atIndex(0),
        ).toBeVisible();

        await suspendCredential(credentialId, authToken);

        await reloadApp({
          credentialUpdate: [
            {
              expectedLabel: 'Suspended',
              index: 0,
              status: CredentialStatus.SUSPENDED,
            },
          ],
        });
        const card = await WalletScreen.credentialAtIndex(0);
        await card.verifyStatus(CredentialStatus.SUSPENDED);
        await WalletScreen.openDetailScreen(0);

        await CredentialDetailScreen.screen.waitForScreenVisible();
        await CredentialDetailScreen.credentialCard.verifyStatus(
          CredentialStatus.SUSPENDED,
          'Suspended',
        );

        await expect(
          CredentialDetailScreen.historyEntryList.historyRow(0).element,
        ).toExist();
        await expect(
          CredentialDetailScreen.historyEntryList.historyRow(0).label,
        ).toHaveText('Credential suspended');
      });
    });

    describe('Revoke credential', () => {
      beforeEach(async () => {
        const issuerHolderCredentialIds = await credentialIssuance({
          authToken: authToken,
          credentialSchema: credentialSchemaJWT_with_LVVC,
          exchange: IssuanceProtocol.OPENID4VCI_DRAFT13,
        });
        credentialId = issuerHolderCredentialIds.issuerCredentialId;
      });
      it('Revoke credential', async () => {
        await revokeCredential(credentialId, authToken);
        await reloadApp({
          credentialUpdate: [
            {
              expectedLabel: 'Revoked',
              index: 0,
              status: CredentialStatus.REVOKED,
            },
          ],
        });
        const card = await WalletScreen.credentialAtIndex(0);
        await card.verifyStatus(CredentialStatus.REVOKED, 'Revoked');
        await WalletScreen.openDetailScreen(0);

        await expect(
          CredentialDetailScreen.historyEntryList.historyRow(0).element,
        ).toExist();
        await expect(
          CredentialDetailScreen.historyEntryList.historyRow(0).label,
        ).toHaveText('Credential revoked');
        await CredentialDetailScreen.credentialCard.verifyStatus(
          CredentialStatus.REVOKED,
          'Revoked',
        );
      });
    });
  });

  // Pass
  describe('ONE-618: Credential deletion', () => {
    beforeAll(async () => {
      await launchApp({ delete: true });
      await credentialIssuance({
        authToken: authToken,
        credentialSchema: credentialSchemaJWT_with_LVVC,
        exchange: IssuanceProtocol.OPENID4VCI_DRAFT13,
      });
    });

    beforeEach(async () => {
      const credentialCard = await WalletScreen.credentialAtIndex(0);
      await expect(credentialCard.element).toBeVisible();
      await credentialCard.openDetail();
      await CredentialDetailScreen.screen.waitForScreenVisible();
      await CredentialDetailScreen.actionButton.tap();
      await CredentialDetailScreen.action(Action.DELETE_CREDENTIAL).tap();
    });

    it('Cancel confirmation', async () => {
      await CredentialDeletePromptScreen.cancelButton.tap();
      await CredentialDetailScreen.screen.waitForScreenVisible();
      await expect(
        CredentialDetailScreen.credentialCard.header.label(
          CredentialStatus.REVOKED,
        ),
      ).not.toExist();
      await expect(
        CredentialDetailScreen.credentialCard.header.label(
          CredentialStatus.SUSPENDED,
        ),
      ).not.toExist();

      await CredentialDetailScreen.backButton.tap();
      await expect(WalletScreen.screen).toBeVisible(1);
      await expect(
        (
          await WalletScreen.credentialAtIndex(0)
        ).element,
      ).toBeVisible();
    });

    // pass
    it('Accept confirmation', async () => {
      await device.disableSynchronization();
      await CredentialDeletePromptScreen.deleteButton.longPress(4001);
      await waitFor(CredentialDeleteProcessScreen.screen)
        .toBeVisible(1)
        .withTimeout(5000);
      await expect(CredentialDeleteProcessScreen.screen).toBeVisible(1);
      await waitFor(CredentialDeleteProcessScreen.status.success)
        .toBeVisible()
        .withTimeout(3000);
      await CredentialDeleteProcessScreen.closeButton.tap();
      await device.enableSynchronization();
      await expect(WalletScreen.screen).toBeVisible(1);
      await WalletScreen.verifyEmptyCredentialList();
    });
  });

  // Pass
  describe('ONE-796: OpenID4VC Credential transport', () => {
    it('Issue credential: JSONLD schema universal link', async () => {
      await credentialIssuance({
        authToken: authToken,
        credentialSchema: credentialSchemaJSONLD,
        exchange: IssuanceProtocol.OPENID4VCI_DRAFT13,
        invitationUrlType: URLOption.UNIVERSAL_LINK,
        redirectUri: 'https://www.procivis.ch',
      });
    });

    it('Issue credential: JWT schema', async () => {
      await credentialIssuance({
        authToken: authToken,
        credentialSchema: credentialSchemaJWT,
        exchange: IssuanceProtocol.OPENID4VCI_DRAFT13,
        redirectUri: 'https://www.procivis.ch',
      });
    });

    it('Issue credential: SD_JWT schema', async () => {
      await credentialIssuance({
        authToken: authToken,
        credentialSchema: credentialSchemaSD_JWT,
        exchange: IssuanceProtocol.OPENID4VCI_DRAFT13,
      });
    });
  });

  // Pass
  describe('ONE-1697: Wallet key storage location', () => {
    let credentialSchemaSoftware: CredentialSchemaResponseDTO;
    let credentialSchemaHardware: CredentialSchemaResponseDTO;

    beforeAll(async () => {
      await launchApp({ delete: true });

      credentialSchemaSoftware = await createCredentialSchema(
        authToken,
        getCredentialSchemaData({
          format: CredentialFormat.JWT,
          revocationMethod: RevocationMethod.STATUSLIST2021,
          walletStorageType: WalletKeyStorageType.SOFTWARE,
        }),
      );
      credentialSchemaHardware = await createCredentialSchema(
        authToken,
        getCredentialSchemaData({
          format: CredentialFormat.JWT,
          revocationMethod: RevocationMethod.STATUSLIST2021,
          walletStorageType: WalletKeyStorageType.HARDWARE,
        }),
      );
    });

    it('Issue Software schema', async () => {
      await credentialIssuance({
        authToken: authToken,
        credentialSchema: credentialSchemaSoftware,
        exchange: IssuanceProtocol.OPENID4VCI_DRAFT13,
      });
      await WalletScreen.openDetailScreen(0);
      await CredentialDetailScreen.screen.waitForScreenVisible();
    });

    // FAIL: Issuance fail (Android) because emulator does not have hardware key. Check that error appears
    it('Issue Hardware schema', async () => {
      await credentialIssuance(
        {
          authToken: authToken,
          credentialSchema: credentialSchemaHardware,
          exchange: IssuanceProtocol.OPENID4VCI_DRAFT13,
        },
        CredentialAction.ACCEPT,
        LoaderViewState.Warning,
        'Your Wallet is incompatible for the defined key storage type.',
      );
    });
  });

  // Pass
  describe('ONE-1233: Picture claim', () => {
    let credentialSchema: CredentialSchemaResponseDTO;
    const pictureKey = 'picture';

    beforeAll(async () => {
      await launchApp({ delete: true });
      credentialSchema = await createCredentialSchema(
        authToken,
        getCredentialSchemaData({
          claims: [
            {
              array: false,
              datatype: DataType.PICTURE,
              key: pictureKey,
              required: true,
            },
          ],
          format: CredentialFormat.JWT,
        }),
      );

      await credentialIssuance({
        authToken,
        credentialSchema,
      });
    });

    it('display picture link in credential detail', async () => {
      await WalletScreen.openDetailScreen(0);
      await CredentialDetailScreen.screen.waitForScreenVisible();
      await expect(
        CredentialDetailScreen.credentialCard.attribute('0').element,
      ).toBeVisible();
      await expect(
        CredentialDetailScreen.credentialCard.attribute('0').title,
      ).toHaveText('picture');
      await CredentialDetailScreen.credentialCard.attribute('0').image.tap();
      await expect(ImagePreviewScreen.screen).toBeVisible(1);
      await expect(ImagePreviewScreen.title).toHaveText(pictureKey);
      await ImagePreviewScreen.closeButton.tap();
      await CredentialDetailScreen.screen.waitForScreenVisible();
    });
  });

  // Pass
  describe('ONE-1861: Nested claim', () => {
    const claims = [
      { array: false, datatype: DataType.EMAIL, key: 'email', required: true },
      {
        array: false,
        claims: [
          {
            array: false,
            datatype: DataType.STRING,
            key: 'country',
            required: true,
          },
          {
            array: false,
            datatype: DataType.STRING,
            key: 'region',
            required: true,
          },
          {
            array: false,
            datatype: DataType.STRING,
            key: 'city',
            required: true,
          },
          {
            array: false,
            datatype: DataType.STRING,
            key: 'street',
            required: true,
          },
        ],
        datatype: DataType.OBJECT,
        key: 'address',
        required: true,
      },
    ];
    beforeAll(async () => {
      const credentialSchema = await createCredentialSchema(
        authToken,
        getCredentialSchemaData({
          claims: claims,
          format: CredentialFormat.JWT,
        }),
      );
      await credentialIssuance({
        authToken: authToken,
        credentialSchema: credentialSchema,
        exchange: IssuanceProtocol.OPENID4VCI_DRAFT13,
      });
    });

    it('Issue credential with object claims', async () => {
      await WalletScreen.openDetailScreen(0);
      await CredentialDetailScreen.screen.waitForScreenVisible();
    });
  });

  // Pass
  describe('ONE-1799: Searching Credential', () => {
    let schema1: CredentialSchemaResponseDTO;
    let schema2: CredentialSchemaResponseDTO;

    beforeAll(async () => {
      await launchApp({ delete: true });
      schema1 = await createCredentialSchema(
        authToken,
        getCredentialSchemaData({
          claims: [
            {
              array: false,
              datatype: DataType.STRING,
              key: 'first name',
              required: true,
            },
            {
              array: false,
              datatype: DataType.STRING,
              key: 'last name',
              required: true,
            },
            {
              array: false,
              datatype: DataType.EMAIL,
              key: 'email',
              required: true,
            },
          ],
          format: CredentialFormat.SD_JWT,
          name: `Schema-1 for test ${shortUUID()}`,
        }),
      );
      schema2 = await createCredentialSchema(
        authToken,
        getCredentialSchemaData({
          claims: [
            {
              array: false,
              datatype: DataType.STRING,
              key: 'first name',
              required: true,
            },
            {
              array: false,
              datatype: DataType.STRING,
              key: 'last name',
              required: true,
            },
            {
              array: false,
              datatype: DataType.EMAIL,
              key: 'email',
              required: true,
            },
          ],
          format: CredentialFormat.JSON_LD_CLASSIC,
          name: `Schema-2 for test ${shortUUID()}`,
        }),
      );
      await credentialIssuance({
        authToken,
        credentialSchema: schema1,
      });
      await credentialIssuance({
        authToken,
        credentialSchema: schema2,
      });
    });

    afterEach(async () => {
      await WalletScreen.search.clearText();
    });

    it('Searching credential', async () => {
      await expect(WalletScreen.screen).toBeVisible(1);
      await WalletScreen.search.element.tap();
      await WalletScreen.search.typeText('Schema\n');
      await waitForElementVisible(WalletScreen.credentialName(schema1.name));
      await waitForElementVisible(WalletScreen.credentialName(schema2.name));
    });

    it('Check credential search find only 1 matches', async () => {
      await WalletScreen.search.element.tap();
      await WalletScreen.search.typeText('Schema-2\n');
      await waitForElementVisible(WalletScreen.credentialName(schema2.name));
      await expect(WalletScreen.credentialName(schema1.name)).not.toBeVisible();
    });
  });

  // Pass
  describe('ONE-1870: Handling Errors in Credential Offering Process', () => {
    beforeAll(async () => {
      await reloadApp();
    });

    it('Wrong share URI', async () => {
      const invitationUrl =
        'https://core.dev.procivis-one.com/ssi/temporary-issuer/v1/connect?protocol=PROCIVIS_TEMPORARY&credential=8a611gad-30b5-4a35-9fa5-b2f86d7279a3';
      await scanURL(invitationUrl);

      await expect(InvitationProcessScreen.screen).toBeVisible(1);
      await expect(element(by.text('Connection failed'))).toBeVisible();
      await InvitationProcessScreen.infoButton.tap();
      await expect(InvitationErrorDetailsScreen.screen).toBeVisible(1);
      await InvitationErrorDetailsScreen.close.tap();
      await expect(InvitationProcessScreen.screen).toBeVisible(1);
      await InvitationProcessScreen.closeButton.tap();
      await expect(WalletScreen.screen).toBeVisible(1);
    });
  });

  describe('ONE-2063: Boolean DataType', () => {
    let booleanSchema: CredentialSchemaResponseDTO;

    beforeAll(async () => {
      await launchApp({ delete: true });
      booleanSchema = await createCredentialSchema(
        authToken,
        getCredentialSchemaData({
          claims: [
            {
              array: false,
              datatype: DataType.BOOLEAN,
              key: 'Vip?',
              required: true,
            },
            {
              array: false,
              datatype: DataType.BOOLEAN,
              key: 'Married?',
              required: true,
            },
            {
              array: false,
              datatype: DataType.STRING,
              key: 'First name',
              required: true,
            },
          ],
          format: CredentialFormat.SD_JWT,
          revocationMethod: RevocationMethod.LVVC,
        }),
      );
    });

    it('Issue credential with boolean', async () => {
      await credentialIssuance({
        authToken: authToken,
        credentialSchema: booleanSchema,
        didFilter: {
          didMethods: DidMethod.WEB,
          keyAlgorithms: KeyType.ECDSA,
        },
        exchange: IssuanceProtocol.OPENID4VCI_DRAFT13,
      });
      await WalletScreen.openDetailScreen(0);
      await CredentialDetailScreen.screen.waitForScreenVisible();
      const card = CredentialDetailScreen.credentialCard;
      //Vip?
      await expect(card.attribute('0').value).toHaveText('true');
      //Married?
      await expect(card.attribute('1').value).toHaveText('true');
      //First name
      await expect(card.attribute('2').value).toHaveText('string');
    });
  });

  // Pass
  describe('ONE-2980: Credentials ordering', () => {
    beforeAll(async () => {
      await launchApp({ delete: true });
      await credentialIssuance({
        authToken: authToken,
        credentialSchema: credentialSchemaSD_JWT,
        exchange: IssuanceProtocol.OPENID4VCI_DRAFT13,
      });
      await credentialIssuance({
        authToken: authToken,
        credentialSchema: credentialSchemaJWT,
        exchange: IssuanceProtocol.OPENID4VCI_DRAFT13,
      });
      await credentialIssuance({
        authToken: authToken,
        credentialSchema: credentialSchemaJWT_with_LVVC,
        exchange: IssuanceProtocol.OPENID4VCI_DRAFT13,
      });
    });

    it('credential ordering', async () => {
      const schemaNames = [
        credentialSchemaJWT.name,
        credentialSchemaJWT_with_LVVC.name,
        credentialSchemaSD_JWT.name,
      ];
      for (let i = 0; i < schemaNames.length; i++) {
        const card = await WalletScreen.credentialAtIndex(i);
        await expect(card.header.name).toHaveText(schemaNames[i]);
      }

      await expect(WalletScreen.screen).toBeVisible(1);
    });
  });
});
