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
        backgroundColor: function (cardBackgroundColor: string) {
          return element(
            by.id(`${cardId}.cardBackgroundColor.${cardBackgroundColor}`),
          );
        },
        get carousel() {
          return element(by.id(id));
        },
        dot: function (index: number) {
          return element(by.id(`${id}.dot.${index}`));
        },
      };
    },
    get card() {
      return {
        get body() {
          return element(by.id(cardId));
        },
        get collapsed() {
          return element(by.id(`${testID}.collapsed`));
        },
        get expanded() {
          return element(by.id(`${testID}.expanded`));
        },
      };
    },
    collapseOrExpand: async function () {
      await this.header.element.tap();
    },
    get element() {
      return element(by.id(testID));
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
              return element(by.id(`${id}.revoked`));
            },
            get suspended() {
              return element(by.id(`${id}.suspended`));
            },
          };
        },
        get logo() {
          return {
            backgroundColor: (logoBackgroundColor: string) => {
              return element(
                by.id(`${id}.logoBackgroundColor.${logoBackgroundColor}`),
              );
            },
            get icon() {
              return element(by.id(`${id}.logoIcon`));
            },
            get name() {
              return element(by.id(`${id}.logoName`));
            },
            textColor: (logoTextColor: string) => {
              return element(by.id(`${id}.logoTextColor.${logoTextColor}`));
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
      await this.verifyCarouselIsVisible();
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
    verifyCardBackgroundColor: async function (backgroundColor: string) {
      await expect(this.body.backgroundColor(backgroundColor)).toBeVisible();
    },
    verifyCarouselIsVisible: async function (visible: boolean = true) {
      if (visible) {
        await expect(this.body.carousel).toBeVisible();
      } else {
        await expect(this.body.carousel).not.toBeVisible();
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
    verifyIsCardCollapsed: async function (collapsed: boolean = true) {
      if (collapsed) {
        await expect(this.card.collapsed).toBeVisible();
      } else {
        await expect(this.card.expanded).toBeVisible();
      }
    },
    verifyIsVisible: async function () {
      await expect(this.element).toBeVisible();
    },
    verifyLogoColor: async function (
      backgroundColor: string,
      textColor: string,
    ) {
      await expect(
        this.header.logo.backgroundColor(backgroundColor),
      ).toBeVisible();
      await expect(this.header.logo.textColor(textColor)).toBeVisible();
    },
    verifyStatus: async function (status: 'revoked' | 'suspended') {
      await expect(this.header.label[status]).toBeVisible();
    },
  };
}
