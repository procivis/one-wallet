import { expect } from 'detox';

export const CardSkeleton = (testID: string) => {
  const cardId = `${testID}.card`;
  return {
    get card() {
      return {
        get collapsed() {
          return element(by.id(`${testID}.collapsed`));
        },
        get expanded() {
          return element(by.id(`${testID}.expanded`));
        },
      };
    },
    claim(index: number) {
      const claimId = `${testID}.claim.${index}`;
      return {
        get element() {
          return element(by.id(claimId));
        },
        get image() {
          return element(by.id(`${claimId}.image`));
        },
        get title() {
          return element(by.id(`${claimId}.title`));
        },
        get value() {
          return element(by.id(`${claimId}.value`));
        },
      };
    },
    get element() {
      return element(by.id(testID));
    },
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

export default function ProofCredentialCard(testID: string) {
  const card = CardSkeleton(testID);
  return {
    collapseOrExpand: async function () {
      await card.header.element.tap();
    },
    get element() {
      return element(by.id(testID));
    },
    multipleCredentialsHeaderAvailable: async function () {
      await expect(card.header.multiple).toBeVisible();
      await expect(card.header.multiple).toHaveText(
        'Multiple credentials available',
      );
    },
    openMultipleCredentialsScreen: async function () {
      await expect(card.notice.multiple.element).toBeVisible();
      await card.notice.multiple.selectButton.tap();
    },
    selectiveDisclosureMessageVisible: async function () {
      await expect(card.notice.element).toBeVisible();
      await expect(card.notice.text).toHaveText(
        'This credential requires you to share all attributes to work.',
      );
    },
    get this() {
      return card;
    },
    verifyClaimValue: async function (
      index: number,
      key: string,
      value?: string,
      image?: boolean,
    ) {
      await expect(card.claim(index).title).toHaveText(key);
      if (image) {
        await expect(card.claim(index).image).toBeVisible();
      } else if (value) {
        await expect(card.claim(index).value).toHaveText(value);
      }
    },
    verifyClaimValues: async function (
      attributes: Array<{ image?: boolean; key: string; value?: string }>,
      scrollTo: (
        element: Detox.IndexableNativeElement,
        direction: 'up' | 'down',
      ) => Promise<void>,
    ) {
      for (const [index, attribute] of attributes.entries()) {
        await scrollTo(card.claim(index).element, 'down');
        await this.verifyClaimValue(index, attribute.key, attribute.value);
      }
    },

    verifyCredentialName: async function (credentialName: string) {
      await expect(card.header.name).toHaveText(credentialName);
    },
    verifyIsCardCollapsed: async function (collapsed: boolean = true) {
      if (collapsed) {
        await expect(card.card.collapsed).toBeVisible();
      } else {
        await expect(card.card.expanded).toBeVisible();
      }
    },
    verifyIsVisible: async function (visible: boolean = true) {
      if (visible) {
        await expect(this.element).toBeVisible();
      } else {
        await expect(this.element).not.toBeVisible();
      }
    },
    verifyStatus: async function (
      status: 'missing' | 'invalid' | 'multiple' | 'revoked' | 'suspended',
    ) {
      await expect(card.header[status]).toBeVisible();
    },
  };
}
