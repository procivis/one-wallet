import { reportException } from '@procivis/one-react-native-components';
import {
  DocumentPickerOptions,
  DocumentPickerResponse,
  errorCodes,
  isErrorWithCode,
  pick,
} from '@react-native-documents/picker';
import { useCallback, useState } from 'react';
import {
  DocumentDirectoryPath,
  exists,
  moveFile,
  unlink,
} from 'react-native-fs';

interface UseDocumentPickerProps {
  pickOptions: DocumentPickerOptions;
}

const useDocumentPicker = ({ pickOptions }: UseDocumentPickerProps) => {
  const [selectedDocument, setSelectedDocument] =
    useState<DocumentPickerResponse>();
  const [selectedDocumentPath, setSelectedDocumentPath] = useState<string>();

  const pickDocument = useCallback(async () => {
    try {
      const [document] = await pick(pickOptions);
      const documentName = document.name?.replace(/\s/g, '_');
      const documentPath = `${DocumentDirectoryPath}/${documentName}`;
      if (await exists(documentPath)) {
        await unlink(documentPath);
      }
      await moveFile(decodeURI(document.uri), documentPath);
      setSelectedDocument(document);
      setSelectedDocumentPath(documentPath);
      return { document, documentPath };
    } catch (e) {
      if (!isErrorWithCode(e) || e.code !== errorCodes.OPERATION_CANCELED) {
        reportException(e, 'File selection failure');
      }
      return {};
    }
  }, [pickOptions]);

  return {
    pickDocument,
    selectedDocument,
    selectedDocumentPath,
  };
};

export default useDocumentPicker;
