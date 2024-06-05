import { expect } from 'detox';

export enum CarouselImageType {
  Barcode = 'Barcode',
  MRZ = 'MRZ',
  Photo = 'Photo',
  QrCode = 'QrCode',
}

export enum CardHeaderOption {
  detail = 'detail',
  missing = 'missing',
  multiple = 'multiple',
  revoked = 'revoked',
  secondaryDetail = 'secondaryDetail',
  suspended = 'suspended',
}

export default function CredentialCard(testID: string) {
  const cardId = `${testID}.card`;
  return {
    attribute: (key: string) => {
      const id = `${testID}.attribute.${key}`;
      return {
        get element() {
          return element(by.id(id));
        },
        get image() {
          return element(by.id(`${id}.image`));
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
          return {
            get cardImage() {
              return element(by.id(`${id}.cardImage`));
            },
            get element() {
              return element(by.id(id));
            },
            image: function (type: CarouselImageType) {
              return element(by.id(`${id}.${type.toString()}`));
            },
            get imageSource() {
              return element(by.id(`${id}.imageSource`));
            },
          };
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
          return {
            get primaryDetail() {
              return element(by.id(`${id}.detail`));
            },
            get secondaryDetail() {
              return element(by.id(`${id}.secondaryDetail`));
            },
          };
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
        .whileElement(by.id('CredentialDetailScreen.scroll'))
        .scroll(200, 'down');
      await this.showAllAttributesButton.tap();
    },
    get showAllAttributesButton() {
      return element(by.id(`${testID}.showAllAttributesButton`));
    },
    swipe: async function (direction: 'left' | 'right') {
      await this.verifyCarouselIsVisible();
      await this.body.carousel.element.swipe(direction);
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
        await expect(this.body.carousel.element).toBeVisible();
      } else {
        await expect(this.body.carousel.element).not.toBeVisible();
      }
    },
    verifyCredentialName: async function (credentialName: string) {
      await expect(this.header.name).toHaveText(credentialName);
    },
    verifyDetailLabel: async function (
      primaryAttr: string,
      secondaryAttr?: string,
    ) {
      await expect(this.header.detail.primaryDetail).toBeVisible();
      await expect(this.header.detail.primaryDetail).toHaveText(primaryAttr);
      if (secondaryAttr) {
        await expect(this.header.detail.secondaryDetail).toBeVisible();
        await expect(this.header.detail.secondaryDetail).toHaveText(
          secondaryAttr,
        );
      }
    },
    verifyImageIsVisible: async function (
      imageType: CarouselImageType,
      visible: boolean = true,
    ) {
      interface Result {
        invisible: number[];
        visible: number[];
      }
      const result: Result = {
        invisible: [],
        visible: [],
      };

      for (let i = 0; i < 4; i++) {
        try {
          const image = this.body.carousel.image(imageType).atIndex(i);
          if (visible) {
            await expect(image).toBeVisible();
            result.visible.push(i);
            break;
          } else {
            await expect(image).not.toBeVisible();
            result.invisible.push(i);
          }
        } catch (error) {
          if (visible) {
            result.invisible.push(i);
          } else {
            result.visible.push(i);
          }
        }
      }

      if (visible && result.visible.length === 0) {
        throw Error(`Expected image of type ${imageType} is not visible.`);
      }

      if (!visible && result.invisible.length !== 4) {
        throw Error(
          `Expected image of type ${imageType} to be invisible, but it was visible.`,
        );
      }
    },
    verifyIsCardCollapsed: async function (collapsed: boolean = true) {
      if (collapsed) {
        await expect(this.card.collapsed).toBeVisible();
      } else {
        await expect(this.card.expanded).toBeVisible();
      }
    },
    verifyIsVisible: async function (visible: boolean = true) {
      if (visible) {
        await expect(this.element).toBeVisible();
      } else {
        await expect(this.element).not.toBeVisible();
      }
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
