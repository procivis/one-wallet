import {
  Typography,
  useAppColorScheme,
} from '@procivis/one-react-native-components';
import { barcode } from 'pure-svg-code';
import QRCode from 'qrcode-svg';
import React, { FC, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

const styles = StyleSheet.create({
  // eslint-disable-next-line react-native/no-color-literals
  barcodeBackground: {
    alignSelf: 'center',
    backgroundColor: 'white',
    borderRadius: 5,
  },
  barcodeContent: {
    margin: 12,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  // eslint-disable-next-line react-native/no-color-literals
  mrzBackground: {
    backgroundColor: 'white',
    paddingHorizontal: 12,
  },
});

type BarcodeProps = {
  content: string;
  height?: number;
  testID?: string;
  width?: number;
};

export const Barcode: FC<BarcodeProps> = ({
  content,
  width = 220,
  height = 80,
  testID,
}) => {
  const colorScheme = useAppColorScheme();
  const barcodeXml = useMemo(
    () =>
      barcode(content, 'code128', {
        barHeight: height,
        bgColor: colorScheme.white,
        width: width,
      }),
    [content, colorScheme, height, width],
  );

  return (
    <View style={styles.container}>
      <View style={styles.barcodeBackground}>
        <SvgXml
          height={height}
          style={[styles.barcodeBackground, styles.barcodeContent]}
          testID={testID}
          width={width}
          xml={barcodeXml}
        />
      </View>
    </View>
  );
};

type QrCodeProps = {
  content: string;
  testID?: string;
};

export const QrCode: FC<QrCodeProps> = ({ content, testID }) => {
  const qrCodeXml = useMemo(() => {
    return new QRCode({
      container: 'svg-viewbox',
      content,
      join: true,
      padding: 1,
    }).svg();
  }, [content]);
  return (
    <SvgXml height={'100%'} testID={testID} width={'100%'} xml={qrCodeXml} />
  );
};

export const Mrz: FC<{ content: string; testID?: string }> = ({
  content,
  testID,
}) => {
  const colorScheme = useAppColorScheme();
  return (
    <View style={[styles.container, styles.mrzBackground]}>
      <Typography color={colorScheme.text} preset={'s/code'} testID={testID}>
        {content}
      </Typography>
    </View>
  );
};
