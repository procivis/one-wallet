import { expect } from 'detox';

export default abstract class UserAgreementScreen {
  static get screen() {
    return element(by.id('UserAgreementScreen'));
  }

  static get termsOfServiceButton() {
    return element(by.id('UserAgreementScreen.termsOfService'));
  }

  static get privacyPolicyButton() {
    return element(by.id('UserAgreementScreen.privacyPolicy'));
  }
  static get termsAgreementCheckbox() {
    const field = element(by.id('UserAgreementScreen.checkbox'));
    return {
      get checkbox() {
        return field;
      },
      verifyChecked(checked: boolean = true) {
        return expect(field).toHaveLabel(checked ? 'checked' : 'not checked');
      },
    };
  }

  static get acceptButton() {
    return element(by.id('UserAgreementScreen.accept'));
  }
}
