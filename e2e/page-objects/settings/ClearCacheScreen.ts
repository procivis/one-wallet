import Button from '../components/Button';
import RadioButon from '../components/RadioButton';

export enum ClearOptions {
  AllCaches = 'ClearAllCaches',
  RevocationAndTrustData = 'ClearRevocationAndTrustData',
}

export default class ClearCacheScreen {
  static get screen() {
    return element(by.id('ClearCacheScreen'));
  }

  static get back() {
    return element(by.id('ClearCacheScreen.header.back'));
  }

  static get scroll() {
    return by.id('ClearCacheScreen.scroll');
  }

  static get clearOptionsRadioButon() {
    return new RadioButon<ClearOptions>([
      'ClearRevocationAndTrustData',
      'ClearAllCaches',
    ]);
  }

  static get clearButton() {
    return new Button('ClearCacheScreen.mainButton');
  }
}
