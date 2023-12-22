// copied from components library
enum LoadingResultState {
  InProgress = 'inProgress',
  Success = 'success',
  Failure = 'failure',
  Error = 'error',
}

export default function LoadingResult(screenTestID: string) {
  return {
    get screen() {
      return element(by.id(screenTestID));
    },
    get ctaButton() {
      return element(by.id(`${screenTestID}.cta`));
    },
    get closeButton() {
      return element(by.id(`${screenTestID}.close`));
    },
    get status() {
      const res = {} as Record<LoadingResultState, Detox.IndexableNativeElement>;
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
