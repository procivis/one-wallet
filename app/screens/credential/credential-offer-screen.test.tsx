import { OneError } from '@procivis/react-native-one-core';
import { screen, within } from '@testing-library/react-native';

import {
  dummyCredentialDetail,
  ONE_CORE_MOCK,
} from '../../../test/utils/core-mock';
import { renderTestScreen } from '../../../test/utils/screen-test';
import { IssueCredentialNavigatorParamList } from '../../navigators/issue-credential/issue-credential-routes';
import CredentialOfferScreen from './credential-offer-screen';

describe('CredentialOfferScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const invitationResult: IssueCredentialNavigatorParamList['CredentialOffer']['invitationResult'] =
    {
      interactionId: 'interactionId',
      protocol: 'protocol',
      requiresWalletInstanceAttestation: false,
      type_: 'CREDENTIAL_ISSUANCE',
    };

  it('renders offer', async () => {
    const credentialId = dummyCredentialDetail.id;
    ONE_CORE_MOCK.holderAcceptCredential.mockResolvedValueOnce(credentialId);
    ONE_CORE_MOCK.getCredential.mockImplementation((id) => {
      expect(id).toEqual(credentialId);
      return Promise.resolve(dummyCredentialDetail);
    });

    await renderTestScreen<
      IssueCredentialNavigatorParamList['CredentialOffer']
    >(CredentialOfferScreen, {
      params: { invitationResult },
    });

    expect(screen.getByTestId('CredentialOfferScreen')).toBeVisible();
    const credentialDetail = screen.getByTestId(
      `HolderCredentialID.value.${credentialId}`,
    );
    expect(credentialDetail).toBeVisible();

    const credential = within(credentialDetail);
    expect(
      credential.getByText(dummyCredentialDetail.schema.name),
    ).toBeVisible();

    const claim = dummyCredentialDetail.claims[0];
    expect(
      credential.getAllByTestId(
        'CredentialOfferScreen.detail.attribute.0.title',
      )[0],
    ).toHaveTextContent(claim.schema.translations.name['en']);
    expect(
      credential.getAllByTestId(
        'CredentialOfferScreen.detail.attribute.0.value',
      )[0],
    ).toHaveTextContent(claim.value.value as string);
  });

  it('handles unknown acceptance failure', async () => {
    const acceptError = 'test-accept-error';
    ONE_CORE_MOCK.holderAcceptCredential.mockRejectedValueOnce(acceptError);

    await renderTestScreen<
      IssueCredentialNavigatorParamList['CredentialOffer']
    >(CredentialOfferScreen, {
      otherScreens: ['Result'],
      params: { invitationResult },
    });

    // navigates to Result screen
    expect(screen.queryByTestId('CredentialOfferScreen')).toBeNull();
    expect(screen.getByTestId('Screen-Result')).toBeVisible();
    expect(screen.getByTestId('Param-error')).toHaveTextContent(acceptError);
  });

  it.each(['BR_0169', 'BR_0170'])(
    'handles txCode error: %s',
    async (errorCode) => {
      const acceptError = new OneError({
        code: errorCode,
        message: 'TX code required',
        operation: 'holderAcceptCredential',
        originalError: new Error(),
      });
      ONE_CORE_MOCK.holderAcceptCredential.mockRejectedValueOnce(acceptError);

      const txCode = '1234';

      await renderTestScreen<
        IssueCredentialNavigatorParamList['CredentialOffer']
      >(CredentialOfferScreen, {
        otherScreens: ['CredentialConfirmationCode'],
        params: { invitationResult, txCode },
      });

      // navigates to CredentialConfirmationCode screen
      expect(screen.queryByTestId('CredentialOfferScreen')).toBeNull();
      expect(
        screen.getByTestId('Screen-CredentialConfirmationCode'),
      ).toBeVisible();
      expect(screen.getByTestId('Param-invalidCode')).toHaveTextContent(txCode);
    },
  );
});
