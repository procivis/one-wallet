export default abstract class ProofRequestSharingScreen {
  static get screen() {
    return element(by.id('ProofRequestSharingScreen'));
  }

  static get cancelButton() {
    return element(by.id('ProofRequestSharingScreen.cancel'));
  }

  static get shareButton() {
    return element(by.id('ProofRequestSharingScreen.submit'));
  }

  static credential(credentialItemIndex: number) {
    const id = `ProofRequestSharingScreen.credential.input_${credentialItemIndex}`;
    return {
      get element() {
        return element(by.id(id));
      },

      title(credentialId: string) {
        return element(by.id(`${id}.title.${credentialId}`));
      },

      get subtitle() {
        const subtitleId = `${id}.subtitle`;
        return {
          get missing() {
            return element(by.id(`${subtitleId}.missing`));
          },
          get revoked() {
            return element(by.id(`${subtitleId}.revoked`));
          },
        };
      },

      get notice() {
        const noticeId = `${id}.notice`;
        return {
          get missing() {
            return element(by.id(`${noticeId}.missing`));
          },
          get revoked() {
            return element(by.id(`${noticeId}.revoked`));
          },
          get multiple() {
            const multipleId = `${noticeId}.multiple`;
            return {
              get element() {
                return element(by.id(multipleId));
              },
              get selectButton() {
                return element(by.id(`${multipleId}.button`));
              },
            };
          },
        };
      },
    };
  }
}
