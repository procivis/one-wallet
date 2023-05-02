import { Configuration } from '../../../models/config/config';
import { commonConfig } from '../common/config';

export const config: Configuration = {
  ...commonConfig,
  appName: 'ONE+ Wallet',
  backendConfig: {
    host: 'TODO',
    endpoints: {
      onboardingInvitation: '/api/v1/onboarding/invitation',
    },
  },
};
