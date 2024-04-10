export default abstract class OnboardingSetupScreen {
  static get screen() {
    return element(by.id('OnboardingSetupScreen'));
  }

  static get setupButton() {
    return element(by.id('OnboardingSetupScreen.setup'));
  }

  static get restoreButton() {
    return element(by.id('OnboardingSetupScreen.restore'));
  }
}
