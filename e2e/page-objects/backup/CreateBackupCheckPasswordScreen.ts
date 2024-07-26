interface FillPasswordProps {
  pressBack?: boolean;
}

export default abstract class CreateBackupCheckPasswordScreen {
  static get screen() {
    return element(by.id('CreateBackupCheckPasswordScreen'));
  }
  private static get passwordField() {
    return {
      get accessoryButton() {
        return element(
          by.id(
            'CreateBackupCheckPasswordScreen.input.password.accessoryButton',
          ),
        );
      },
      get element() {
        return element(by.id('CreateBackupCheckPasswordScreen.input.password'));
      },
    };
  }

  static get submitButton() {
    return element(by.id('CreateBackupCheckPasswordScreen.mainButton'));
  }

  static async fillPassword(password: string, props?: FillPasswordProps) {
    const attributes = await this.passwordField.element.getAttributes();
    if ('text' in attributes && attributes.text !== '') {
      await this.passwordField.accessoryButton.tap();
    }
    await this.passwordField.element.typeText(password);
    if (props?.pressBack) {
      await device.pressBack();
    }
  }
}
