import NerdViewScreen from '../components/NerdModeScreen';

export enum AttributeTestID {
  credentialFormat = 'credentialFormat',
  dateAdded = 'dateAdded',
  documentType = 'documentType',
  issuerDID = 'issuerDID',
  revocationMethod = 'revocationMethod',
  schema = 'schema',
  schemaName = 'schemaName',
  storageType = 'storageType',
  validity = 'validity',
}

export default NerdViewScreen<AttributeTestID>('CredentialOffer.nerdView');
