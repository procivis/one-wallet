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
  // `code` can be set in the native code
  const code = (e as any)?.code ?? '';

  if (!__DEV__) {
    try {
      Sentry.withScope((scope) => {
        if (message) {
          scope.setExtra('message', message);
        }
        if (code) {
          scope.setExtra('code', code);
        }
        Sentry.captureException(e);
      });
    } catch (error) {
      // do nothing
    }
  } else {
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
