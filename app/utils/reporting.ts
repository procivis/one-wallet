import * as Sentry from '@sentry/react-native';

export function reportError(message: string) {
  if (!__DEV__) {
    try {
      Sentry.captureException(new Error(message));
    } catch (error) {
      // do nothing
    }
  } else {
    // eslint-disable-next-line no-console
    console.warn('reportError:', message);
  }
}

export function reportException(e: unknown, message?: string) {
  if (!__DEV__) {
    try {
      Sentry.withScope((scope) => {
        scope.setExtra('extra', message);
        Sentry.captureException(e);
      });
    } catch (error) {
      // do nothing
    }
  } else {
    // eslint-disable-next-line no-console
    console.warn(`reportException${message ? `(${message})` : ''}:`, e, e instanceof Error ? e.stack : undefined);
  }
}

export function reportTraceInfo(category: string, message?: string, data?: Sentry.Breadcrumb['data']) {
  if (!__DEV__) {
    try {
      Sentry.addBreadcrumb({
        level: 'log',
        category,
        message,
        data,
      });
    } catch (error) {
      // do nothing
    }
  } else {
    const logged: unknown[] = [category, message];
    if (data) logged.push(data);
    // eslint-disable-next-line no-console
    console.log(...logged);
  }
}
