import { ImportCredentialSchemaRequestSchema } from '@procivis/react-native-one-core';

export const getCredentialSchemasFromAssets = () => {
  const schemas = require.context(
    '../../assets/ecosystem-assets',
    true,
    /\.json$/,
  );
  return schemas
    .keys()
    .map((key) => schemas(key) as ImportCredentialSchemaRequestSchema);
};
