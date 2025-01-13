import { Button, TextInput } from '@procivis/one-react-native-components';
import React, { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Code } from 'react-native-vision-camera';

export type ScannerScreenProps = {
  onClose: () => void;
  onQRCodeRead: (code: Code[]) => void;
};

export const ScannerScreen: React.FC<ScannerScreenProps> = ({
  onQRCodeRead,
  onClose,
}) => {
  const [qrContent, setQRContent] = useState('');

  const onPress = useCallback(() => {
    onQRCodeRead([{ type: 'qr', value: qrContent }]);
  }, [qrContent, onQRCodeRead]);

  return (
    <View style={styles.screen}>
      <TextInput
        label="qrCodeContent"
        onChangeText={setQRContent}
        style={styles.qrCodeInput}
        testID="QRCodeScannerMockScreen.textInput"
        value={qrContent}
      />
      <Button
        onPress={onPress}
        testID="QRCodeScannerMockScreen.scanUri"
        title="qrCodeButton"
      />
      <Button
        onPress={onClose}
        testID="QRCodeScannerMockScreen.back"
        title="Back"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  qrCodeInput: {
    height: 50,
    paddingHorizontal: 10,
    width: '100%',
  },
  // eslint-disable-next-line react-native/no-color-literals
  screen: {
    backgroundColor: 'white',
    height: '100%',
    justifyContent: 'center',
    width: '100%',
  },
});
