import {
  addEventListener as onNetworkStateChange,
  NetInfoStateType,
  NetInfoSubscription,
} from '@react-native-community/netinfo';
import parseUrl from 'parse-url';
import { useEffect, useMemo, useState } from 'react';
import { EventSubscription } from 'react-native';
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

export const useAvailableTransports = (
  supportedTransports: Transport[],
): {
  availableTransport: Transport[] | undefined;
  transportError: TransportError;
} => {
  const [internetState, setInternetState] = useState<InternetState>();
  const [bluetoothState, setBluetoothState] = useState<BluetoothState>();

  useEffect(() => {
    let btSubscription: EventSubscription | undefined;
    if (supportedTransports.includes(Transport.Bluetooth)) {
      btSubscription = BTStateManager.onStateChange((state) => {
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
    }
    let netSubscription: NetInfoSubscription | undefined;
    if (
      supportedTransports.includes(Transport.HTTP) ||
      supportedTransports.includes(Transport.MQTT)
    ) {
      netSubscription = onNetworkStateChange((state) => {
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
    }
    return () => {
      btSubscription?.remove();
      netSubscription?.();
    };
  }, [supportedTransports]);

  const transportStatus = useMemo(() => {
    const waitingForInternetState =
      (supportedTransports.includes(Transport.HTTP) ||
        supportedTransports.includes(Transport.MQTT)) &&
      internetState === undefined;
    const waitingForBluetoothState =
      supportedTransports.includes(Transport.Bluetooth) &&
      bluetoothState === undefined;
    if (waitingForInternetState || waitingForBluetoothState) {
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
  }, [bluetoothState, internetState, supportedTransports]);

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
      parsedUrl.query.topicId
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
