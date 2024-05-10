import PasswordStrength from '../components/PasswordStrength';

export enum Tip {
  Length = 'length',
  Number = 'number',
  Symbol = 'symbol',
  Upper = 'upper',
}

interface FillPasswordProps {
  pressBack?: boolean;
}

export default abstract class CreateBackupSetPasswordScreen {
  static get screen() {
    return element(by.id('CreateBackupSetPasswordScreen'));
  }

  private static get passwordField() {
    return {
      get accessoryButton() {
        return element(
          by.id('CreateBackupSetPasswordScreen.input.password.accessoryButton'),
        );
      },
      get element() {
        return element(by.id('CreateBackupSetPasswordScreen.input.password'));
      },
    };
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

  static get setPasswordButton() {
    return element(by.id('CreateBackupSetPasswordScreen.mainButton'));
  }

  static get passwordStrength() {
    return PasswordStrength('CreateBackupSetPasswordScreen.strength');
  }
}
