import {
  addEventListener as onNetworkStateChange,
  NetInfoStateType,
} from '@react-native-community/netinfo';
import parseUrl from 'parse-url';
import { useEffect, useMemo, useState } from 'react';
import BTStateManager from 'react-native-bluetooth-state-manager';

export enum InternetState {
  Available,
  Unreachable,
  Disabled,
}

export type InternetError = Exclude<InternetState, InternetState.Available>;

export enum BluetoothState {
  Available,
  Unauthorized,
  Disabled,
  Unavailable,
}

export type BluetoothError = Exclude<BluetoothState, BluetoothState.Available>;

export enum Transport {
  Bluetooth = 'BLE',
  HTTP = 'HTTP',
  MQTT = 'MQTT',
}

export type TransportError = {
  ble?: BluetoothError;
  internet?: InternetError;
};

export const useAvailableTransports = (): {
  availableTransport: Transport[] | undefined;
  transportError: TransportError;
} => {
  const [internetState, setInternetState] = useState<InternetState>();
  const [bluetoothState, setBluetoothState] = useState<BluetoothState>();

  useEffect(() => {
    const btSubscription = BTStateManager.onStateChange((state) => {
      switch (state) {
        case 'PoweredOn':
          setBluetoothState(BluetoothState.Available);
          break;
        case 'PoweredOff':
          setBluetoothState(BluetoothState.Disabled);
          break;
        case 'Unauthorized':
          setBluetoothState(BluetoothState.Unauthorized);
          break;
        default:
          setBluetoothState(BluetoothState.Unavailable);
      }
    }, true);
    const netSubscription = onNetworkStateChange((state) => {
      if (state.type === NetInfoStateType.none) {
        setInternetState(InternetState.Disabled);
        return;
      }
      if (state.isInternetReachable === null) {
        return;
      }
      if (state.isInternetReachable) {
        setInternetState(InternetState.Available);
      } else {
        setInternetState(InternetState.Unreachable);
      }
    });
    return () => {
      btSubscription.remove();
      netSubscription();
    };
  }, []);

  const transportStatus = useMemo(() => {
    if (internetState === undefined || bluetoothState === undefined) {
      return {
        availableTransport: undefined,
        transportError: {},
      };
    }
    const availableTransport: Transport[] = [];
    const transportError: TransportError = {};
    if (internetState === InternetState.Available) {
      availableTransport.push(Transport.MQTT);
      availableTransport.push(Transport.HTTP);
    } else {
      transportError.internet = internetState;
    }
    if (bluetoothState === BluetoothState.Available) {
      availableTransport.push(Transport.Bluetooth);
    } else {
      transportError.ble = bluetoothState;
    }
    return { availableTransport, transportError };
  }, [bluetoothState, internetState]);

  return transportStatus;
};

export const getInvitationUrlTransports = (url: string): Transport[] => {
  const parsedUrl = parseUrl(url);
  if (parsedUrl.parse_failed) {
    return [];
  }
  if ((parsedUrl.protocol as string) !== 'openid4vp') {
    return [Transport.HTTP];
  }
  const transports: Transport[] = [];
  if (parsedUrl.host === 'connect') {
    if (parsedUrl.query.name && parsedUrl.query.key) {
      transports.push(Transport.Bluetooth);
    }
    if (
      parsedUrl.query.key &&
      parsedUrl.query.brokerUrl &&
      parsedUrl.query.proofId
    ) {
      transports.push(Transport.MQTT);
    }
  } else if (
    parsedUrl.query.response_type &&
    parsedUrl.query.state &&
    parsedUrl.query.nonce &&
    parsedUrl.query.presentation_definition_uri
  ) {
    transports.push(Transport.HTTP);
  }
  return transports;
};
