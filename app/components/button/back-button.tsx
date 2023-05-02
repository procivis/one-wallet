// eslint-disable-next-line no-restricted-imports
import { BackButton as TemplateBackButton } from '@procivis/react-native-components';
import React, { ComponentProps, FunctionComponent } from 'react';

import { translate } from '../../i18n';

/**
 * Back button with accessibility features
 */
const BackButton: FunctionComponent<ComponentProps<typeof TemplateBackButton>> = (props) => {
  return <TemplateBackButton accessibilityLabel={translate('common.back')} {...props} />;
};

export default BackButton;
