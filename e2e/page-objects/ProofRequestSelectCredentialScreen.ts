export default abstract class ProofRequestSelectCredentialScreen {
  static get screen() {
    return element(by.id('ProofRequestSelectCredentialScreen'));
  }

  static get backButton() {
    return element(by.id('ProofRequestSelectCredentialScreen.header.back'));
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

      get selected() {
        return element(by.id(`${id}.selected`));
      },
      get unselected() {
        return element(by.id(`${id}.unselected`));
      },
    };
  }
}
