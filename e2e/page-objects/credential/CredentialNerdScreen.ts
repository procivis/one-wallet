import { expect } from 'detox';

export enum AttributeTestID {
  credentialFormat = 'credentialFormat',
  dateAdded = 'dateAdded',
  documentType = 'documentType',
  issuerDID = 'issuerDID',
  revocationMethod = 'revocationMethod',
  schemaName = 'schemaName',
  storageType = 'storageType',
  validity = 'validity',
}

export type Attributes = {
  [key in AttributeTestID]: {
    label: string;
    showMoreButton?: boolean;
    value: string;
  };
};

export default abstract class CredentialNerdScreen {
  static get screen() {
    return element(by.id('CredentialNerdView'));
  }

  static async close() {
    await element(by.id('CredentialNerdView.closeIcon')).tap();
  }

  private static entityClusterEntry() {
    const id = 'CredentialNerdView.entityCluster';
    return {
      get element() {
        return element(by.id(id));
      },
      get name() {
        return element(by.id(`${id}.entityName`));
      },
      get subline() {
        return element(by.id(`${id}.subline`));
      },
    };
  }

  static get entityCluster() {
    return this.entityClusterEntry();
  }

  private static attributeEntry(attribute: AttributeTestID) {
    const id = `CredentialNerdView.${attribute}`;
    return {
      get actionIcon() {
        return element(by.id(`${id}.actionIcon`));
      },
      get element() {
        return element(by.id(id));
      },
      get expandButton() {
        return element(by.id(`${id}.expandValueButton`));
      },
      get label() {
        return element(by.id(`${id}.attributeLabel`));
      },
      get value() {
        return element(by.id(`${id}.attributeValue`));
      },
    };
  }

  private static async scrollTo(element: Detox.IndexableNativeElement) {
    await waitFor(element)
      .toBeVisible()
      .whileElement(by.id('CredentialNerdView'))
      .scroll(100, 'down');
  }

  static attribute(attribute: AttributeTestID) {
    return this.attributeEntry(attribute);
  }

  static async verifyAttributes(attributes: Attributes) {
    for (const key in attributes) {
      const attributeKey = key as AttributeTestID;
      const { label, value, showMoreButton } = attributes[attributeKey];
      await this.scrollTo(this.attribute(attributeKey).label);
      await expect(this.attribute(attributeKey).label).toHaveText(label);
      if (showMoreButton) {
        await this.attribute(attributeKey).expandButton.tap();
      }
      await this.scrollTo(this.attribute(attributeKey).value);
      await expect(this.attribute(attributeKey).value).toHaveText(value);
    }
  }
}
