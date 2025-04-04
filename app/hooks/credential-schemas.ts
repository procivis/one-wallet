import {
  reportException,
  useONECore,
} from '@procivis/one-react-native-components';
import { useCallback } from 'react';

import { getCredentialSchemasFromAssets } from '../utils/credential-schemas';

export const useImportPredefinedCredentialSchemas = () => {
  const { core, organisationId } = useONECore();
  const schemas = getCredentialSchemasFromAssets();

  return useCallback(async () => {
    for (const schema of schemas) {
      await core
        .importCredentialSchema({
          organisationId,
          schema: {
            ...schema,
            organisationId,
          },
        })
        .catch((err) => {
          reportException(err, 'Error importing predefined credential schema');
        });
    }
  }, [core, organisationId, schemas]);
};
