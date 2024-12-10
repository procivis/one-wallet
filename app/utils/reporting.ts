import { OneError } from '@procivis/react-native-one-core';
import * as Sentry from '@sentry/react-native';

export function reportError(message: string) {
  if (!__DEV__) {
    try {
      Sentry.captureException(new Error(message));
    } catch (error) {
      // do nothing
    }
  } else {
    console.warn('reportError:', message);
  }
}

const getDebugExceptionInfo = (
  message: string | undefined,
  code: string | number | undefined,
) => {
  if (message) {
    const codeInfo = code ? `[${code}]` : '';
    return `(${message})${codeInfo}`;
  }
  return `[${code}]`;
};

export function reportException(e: unknown, message?: string) {
  if (!__DEV__) {
    try {
      Sentry.withScope((scope) => {
        if (message) {
          scope.setExtra('message', message);
        }

        if (e instanceof OneError) {
          scope.setExtra('operation', e.operation);
          scope.setExtra('code', e.code);
          scope.setExtra('codeMessage', e.message);
          if (e.cause) {
            scope.setExtra('cause', e.cause);
          }
        }

        Sentry.captureException(e);
      });
    } catch (error) {
      // do nothing
    }
  } else {
    const code = (e as any)?.code ?? '';
    const info = getDebugExceptionInfo(message, code);
    console.warn(
      `reportException${info}:`,
      e,
      e instanceof Error ? e.stack : undefined,
    );
  }
}

export function reportTraceInfo(
  category: string,
  message?: string,
  data?: Sentry.Breadcrumb['data'],
) {
  if (!__DEV__) {
    try {
      Sentry.addBreadcrumb({
        category,
        data,
        level: 'log',
        message,
      });
    } catch (error) {
      // do nothing
    }
  } else {
    const logged: unknown[] = [category, message];

    if (data) {
      logged.push(data);
    }

    console.log(...logged);
  }
}
