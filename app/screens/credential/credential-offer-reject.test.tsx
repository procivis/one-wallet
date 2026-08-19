import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import { Alert, AlertButton } from 'react-native';

import {
  dummyCredentialDetail,
  ONE_CORE_MOCK,
} from '../../../test/utils/core-mock';
import { renderTestScreen } from '../../../test/utils/screen-test';
import { IssueCredentialNavigatorParamList } from '../../navigators/issue-credential/issue-credential-routes';
import CredentialOfferScreen from './credential-offer-screen';

// rejecting the offer while the issuer's accept call is still in flight;
// kept in a separate file because unmounting with a pending promise breaks
// the React test environment for any test running after it
describe('CredentialOfferScreen rejection', () => {
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

  it('rejects an offer that is still being accepted', async () => {
    const credentialId = dummyCredentialDetail.id;
    let completeAcceptance: (id: string) => void = () => {};
    ONE_CORE_MOCK.holderAcceptCredential.mockReturnValueOnce(
      new Promise<string>((resolve) => {
        completeAcceptance = resolve;
      }),
    );
    ONE_CORE_MOCK.holderRejectCredential.mockResolvedValue(undefined);
    const alert = jest.spyOn(Alert, 'alert');

    await renderTestScreen<
      IssueCredentialNavigatorParamList['CredentialOffer']
    >(CredentialOfferScreen, {
      otherScreens: ['Dashboard'],
      params: { invitationResult },
    });

    // the acceptance runs on screen load and is not complete yet
    expect(screen.getByTestId('CredentialOfferScreen')).toBeVisible();

    fireEvent.press(screen.getByTestId('CredentialOfferScreen.header.close'));
    const rejectButton = (alert.mock.calls[0][2] as AlertButton[]).find(
      (button) => button.style === 'destructive',
    );
    rejectButton?.onPress?.();
    await waitFor(() =>
      expect(screen.queryByTestId('CredentialOfferScreen')).toBeNull(),
    );

    // the offer must not be rejected before the acceptance completes
    expect(ONE_CORE_MOCK.holderRejectCredential).not.toHaveBeenCalled();

    completeAcceptance(credentialId);

    await waitFor(() =>
      expect(ONE_CORE_MOCK.holderRejectCredential).toHaveBeenCalledWith(
        invitationResult.interactionId,
      ),
    );
  });
});
