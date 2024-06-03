// copied from components library
import { expect } from 'detox';

export enum LoaderViewState {
  InProgress = 'inProgress',
  Success = 'success',
  Warning = 'warning',
}

export default function LoadingResult(screenTestID: string) {
  return {
    get button() {
      return {
        get close() {
          return element(by.id(`${screenTestID}.close`));
        },
        get redirect() {
          return element(by.id(`${screenTestID}.redirect`));
        },
      };
    },
    get closeButton() {
      return element(by.id('Screen.closeButton'));
    },
    hasText: function (text: string) {
      return expect(element(by.text(text))).toBeVisible();
    },
    get retryButton() {
      return element(by.id(`${screenTestID}.retry`));
    },
    get screen() {
      return element(by.id(screenTestID));
    },
    get status() {
      const res = {} as Record<LoaderViewState, Detox.IndexableNativeElement>;
      Object.values(LoaderViewState).forEach((state) =>
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
