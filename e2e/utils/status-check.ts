import StatusCheckResultScreen from '../page-objects/StatusCheckResultScreen';

export type CredentialUpdateProps = {
  expectedLabel?: string;
  index: number;
  status: 'revoked' | 'suspended' | 'revalidated';
};

export const statusScreenCheck = async (
  credentialUpdate: CredentialUpdateProps[],
) => {
  for (const credential of credentialUpdate) {
    const card = await StatusCheckResultScreen.credentialAtIndex(
      credential.index,
    );
    await card.verifyIsVisible();

    if (credential.status === 'revalidated') {
      if (credential.expectedLabel) {
        await card.verifyDetailLabel(credential.expectedLabel);
      }
    } else {
      await card.verifyStatus(credential.status, credential.expectedLabel);
    }
  }
};
