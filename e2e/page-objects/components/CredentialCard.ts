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

export enum CredentialStatus {
  INVALID = 'invalid',
  MISSING = 'missing',
  MULTIPLE = 'multiple',
  REVALIDATED = 'revalidated',
  REVORED = 'revoked',
  SUSPENDED = 'suspended',
}

export const CredentialCardSkeleton = (testID: string) => {
  const cardId = `${testID}.card`;
  return {
    get header() {
      const headerId = `${cardId}.header`;
      return {
        get element() {
          return element(by.id(headerId));
        },
        get invalid() {
          return element(by.id(`${headerId}.invalid`));
        },
        get missing() {
          return element(by.id(`${headerId}.missing`));
        },
        get multiple() {
          return element(by.id(`${headerId}.multiple`));
        },
        get name() {
          return element(by.id(`${headerId}.name`));
        },
        get revoked() {
          return element(by.id(`${headerId}.revoked`));
        },
        get suspended() {
          return element(by.id(`${headerId}.suspended`));
        },
      };
    },
    get notice() {
      const noticeId = `${testID}.notice`;
      return {
        get element() {
          return element(by.id(`${cardId}.notice`));
        },
        get invalid() {
          return element(by.id(`${noticeId}.invalid`));
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
        get revoked() {
          return element(by.id(`${noticeId}.revoked`));
        },
        get suspended() {
          return element(by.id(`${noticeId}.suspended`));
        },
        get text() {
          return element(by.id(`${cardId}.notice.text`));
        },
      };
    },
  };
};

export default function CredentialCard(testID: string) {
  const cardId = `${testID}.card`;
  const sceleton = CredentialCardSkeleton(testID);
  return {
    attribute: (index: number | string) => {
      const id = `${testID}.attribute.${index}`;
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
        get collapsed() {
          return element(by.id(`${cardId}.collapsed`));
        },
        get expanded() {
          return element(by.id(`${cardId}.expanded`));
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
        label: (status: CredentialStatus) => {
          return element(by.id(`${id}.${status}`));
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
        get openDetailArrow() {
          return element(by.id(`${id}.openDetail`));
        },
      };
    },
    multipleCredentialsHeaderAvailable: async function () {
      await expect(sceleton.header.multiple).toBeVisible();
      await expect(sceleton.header.multiple).toHaveText(
        'Multiple credentials available',
      );
    },
    openDetail: async function () {
      await this.header.openDetailArrow.tap();
    },
    openMultipleCredentialsScreen: async function () {
      await expect(sceleton.notice.multiple.element).toBeVisible();
      await sceleton.notice.multiple.selectButton.tap();
    },
    get sceleton() {
      return sceleton;
    },
    selectiveDisclosureMessageVisible: async function () {
      await expect(sceleton.notice.element).toBeVisible();
      await expect(sceleton.notice.text).toHaveText(
        'This credential requires you to share all attributes to work.',
      );
    },
    showAllAttributes: async function () {
      await this.showAllAttributesButton.tap();
    },
    get showAllAttributesButton() {
      return element(by.id(`${testID}.showAllAttributesButton`));
    },
    swipe: async function (direction: 'left' | 'right') {
      await this.verifyCarouselIsVisible();
      await this.body.carousel.element.swipe(direction);
    },
    verifyAttributeValue: async function (
      index: number | string,
      title: string,
      value?: string,
      image?: boolean,
    ) {
      await expect(this.attribute(index).element).toBeVisible();
      await expect(this.attribute(index).title).toHaveText(title);
      if (image) {
        await expect(this.attribute(index).image).toBeVisible();
      } else if (value) {
        await expect(this.attribute(index).value).toHaveText(value);
      } else {
        throw new Error('Attribute value or image must be provided');
      }
    },
    verifyAttributeValues: async function (
      attributes: Array<{
        image?: boolean;
        index: number | string;
        key: string;
        value?: string;
      }>,
      scrollTo?: (
        element: Detox.IndexableNativeElement,
        direction: 'up' | 'down',
        startPositionY: number,
      ) => Promise<void>,
    ) {
      for (const attribute of attributes) {
        await scrollTo?.(this.attribute(attribute.index).element, 'down', 0.5);
        await this.verifyAttributeValue(
          attribute.index,
          attribute.key,
          attribute.value,
          attribute.image,
        );
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
        } catch (_error) {
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
        await expect(this.card.collapsed).toBeVisible(10);
      } else {
        await expect(this.card.expanded).toBeVisible();
      }
    },
    verifyIsVisible: async function (
      visible: boolean = true,
      pct: number = 75,
    ) {
      if (visible) {
        await expect(this.element).toBeVisible(pct);
      } else {
        await expect(this.element).not.toBeVisible(pct);
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
    verifyStatus: async function (status: CredentialStatus, label?: string) {
      await expect(this.header.label(status)).toBeVisible();
      if (label) {
        await expect(this.header.label(status)).toHaveText(label);
      }
    },
  };
}
