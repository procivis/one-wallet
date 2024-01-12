// copied from components library
enum LoadingResultState {
  Error = 'error',
  Failure = 'failure',
  InProgress = 'inProgress',
  Success = 'success',
}

export default function LoadingResult(screenTestID: string) {
  return {
    get closeButton() {
      return element(by.id(`${screenTestID}.close`));
    },
    get ctaButton() {
      return element(by.id(`${screenTestID}.cta`));
    },
    get retryButton() {
      return element(by.id(`${screenTestID}.retry`));
    },
    get screen() {
      return element(by.id(screenTestID));
    },
    get status() {
      const res = {} as Record<
        LoadingResultState,
        Detox.IndexableNativeElement
      >;
      Object.values(LoadingResultState).forEach((state) =>
        Object.defineProperty(res, state, {
          get: function () {
            return element(by.id(`${screenTestID}.animation.${state}`));
          },
        }),
      );
      return res;
    },
  };
}
