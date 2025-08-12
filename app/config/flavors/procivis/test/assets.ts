// @ts-ignore
import credentialsIssuersJson from '../../../../../assets/ecosystem-assets/wallet-credential-issuers/credentials-test.json';
import { AssetsConfiguration } from '../../../../models/config/assets';
import { RequestCredentialItem } from '../../../../screens/request-credential/request-credential-list-screen';
import { assets as procivisAssets } from '../assets';

export const assets: AssetsConfiguration = {
  ...procivisAssets,
  credentialsIssuers: (credentialsIssuersJson ?? []) as RequestCredentialItem[],
};
