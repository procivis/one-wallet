import { translate } from '../../i18n';

export const entityLabels = {
  notTrusted: translate('trustEntity.notTrusted'),
  privacyPolicy: translate('common.privacyPolicy'),
  termsAndServices: translate('common.termsAndServices'),
  trusted: translate('common.trusted'),
  unknownIssuer: translate('credentialOffer.unknownIssuer'),
  unknownVerifier: translate('proofRequest.unknownVerifier'),
  visitWebsite: translate('common.visitWebsite'),
};

export const attributesLabels = {
  collapse: translate('nerdView.action.collapseAttribute'),
  entityIdentifier: translate('credentialDetail.credential.identifier'),
  expand: translate('nerdView.action.expandAttribute'),
  issuerIdentifier: translate('credentialDetail.credential.identifier'),
  role: translate('common.role'),
  trustRegistry: translate('common.trustRegistry'),
};
