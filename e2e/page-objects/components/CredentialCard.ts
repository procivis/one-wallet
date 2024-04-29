import { expect } from 'detox';

import { formatDateTime } from '../../utils/date';

export default function CredentialCard(testID: string) {
  const cardId = `${testID}.card`;
  return {
    attribute: (key: string) => {
      const id = `${testID}.attribute.${key}`;
      return {
        get element() {
          return element(by.id(id));
        },
        get title() {
          return element(by.id(`${id}.title`));
        },
        get value() {
          return element(by.id(`${id}.value`));
        },
      };
    },
    get body() {
      const id = `${cardId}.carousel`;
      return {
        get carousel() {
          return element(by.id(id));
        },
        dot: function (index: number) {
          return element(by.id(`${id}.dot.${index}`));
        },
      };
    },
    collapseOrExpand: async function () {
      await this.header.element.tap();
    },
    get element() {
      return element(by.id(cardId));
    },
    get header() {
      const id = `${cardId}.header`;
      return {
        get detail() {
          return element(by.id(`${id}.detail`));
        },
        get element() {
          return element(by.id(id));
        },
        get label() {
          return {
            get revoked() {
              return element(by.id(`${testID}.revoked`));
            },
            get suspended() {
              return element(by.id(`${testID}.suspended`));
            },
          };
        },
        get logo() {
          return {
            get icon() {
              return element(by.id(`${testID}.logoIcon`));
            },
            get name() {
              return element(by.id(`${testID}.logoName`));
            },
          };
        },
        get name() {
          return element(by.id(`${id}.name`));
        },
      };
    },
    showAllAttributes: async function () {
      await waitFor(this.showAllAttributesButton)
        .toBeVisible()
        .whileElement(by.id('CredentialDetailScreen.content'))
        .scroll(200, 'down');
      await this.showAllAttributesButton.tap();
    },
    get showAllAttributesButton() {
      return element(by.id(`${testID}.showAllAttributesButton`));
    },
    swipe: async function (direction: 'left' | 'right') {
      await expect(this.body.carousel).toBeVisible();
      await this.body.carousel.swipe(direction);
    },
    verifyAttributeValue: async function (key: string, value: string) {
      await expect(this.attribute(key).value).toHaveText(value);
    },
    verifyAttributeValues: async function (
      attributes: Array<{ key: string; value: string }>,
    ) {
      for (const attribute of attributes) {
        await this.verifyAttributeValue(attribute.key, attribute.value);
      }
    },
    verifyCredentialName: async function (credentialName: string) {
      await expect(this.header.name).toHaveText(credentialName);
    },
    verifyDetailLabel: async function (
      primaryAttr?: string,
      secondaryAttr?: string,
      issuanceDate?: string,
    ) {
      let contentDetail = '';
      if (primaryAttr) {
        contentDetail += primaryAttr;
      } else if (issuanceDate) {
        contentDetail += formatDateTime(new Date(issuanceDate));
      }
      if (secondaryAttr) {
        const interpunct = ' · ';
        contentDetail += `${interpunct}${secondaryAttr}`;
      }
      await expect(this.header.detail).toBeVisible();
      await expect(this.header.detail).toHaveText(contentDetail);
    },
    verifyStatus: async function (status: 'revoked' | 'suspended') {
      await expect(this.header.label[status]).toBeVisible();
    },
  };
}
