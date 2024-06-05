import { expect } from 'detox';

export default abstract class ProofRequestSelectCredentialScreen {
  static get screen() {
    return element(by.id('ProofRequestSelectCredentialScreen'));
  }

  static async scrollTo(
    element: Detox.IndexableNativeElement,
    direction: 'up' | 'down' = 'down',
  ) {
    await waitFor(element)
      .toBeVisible()
      .whileElement(by.id('ProofRequestSelectCredentialScreen.scroll'))
      .scroll(400, direction);
  }

  static get backButton() {
    return element(by.id('Screen.back'));
  }

  static get confirmButton() {
    return element(by.id('ProofRequestSelectCredentialScreen.confirm'));
  }

  static credential(credentialId: string) {
    const id = `ProofRequestSelectCredentialScreen.credential.${credentialId}`;
    return {
      get element() {
        return element(by.id(id));
      },

      get notice() {
        const noticeId = `${id}.notice`;
        return {
          get element() {
            return element(by.id(noticeId));
          },
          get text() {
            return element(by.id(`${noticeId}.text`));
          },
        };
      },
      get selected() {
        return element(by.id(`${id}.selected`));
      },
      selectiveDisclosureMessageVisible: async function () {
        await expect(this.notice.element).toBeVisible();
        await expect(this.notice.text).toHaveText(
          'This credential requires you to share all attributes to work.',
        );
      },
      get unselected() {
        return element(by.id(`${id}.unselected`));
      },
    };
  }
}
