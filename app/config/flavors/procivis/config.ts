import { Configuration } from '../../../models/config/config';
import { commonConfig } from '../common/config';

export const config: Configuration = {
  ...commonConfig,
  appName: 'Procivis One Wallet',
  backendConfig: {
    endpoints: {
      onboardingInvitation: '/api/v1/onboarding/invitation',
    },
    host: 'TODO',
  },
};
