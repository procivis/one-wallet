import { expect } from 'detox';

import TrustEntityDetail from './TrustEntityDetail';

export type Attributes<T extends string | number> = {
  [key in T]?: {
    label: string;
    onlyValueVisibility?: boolean;
    value?: string;
  };
};

const VALUE_PREVIEW_LENGTH = 80;

export default function BaseNerdView<T extends string>(testID: string) {
  function entityClusterEntry() {
    const id = `${testID}.entityCluster`;
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

  function attributeEntry(attribute: T) {
    const id = `${testID}.${attribute}`;
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

  return {
    get TrustEntityInfo() {
      return TrustEntityDetail(`${testID}.entityCluster`);
    },
    attribute: function (attribute: T) {
      return attributeEntry(attribute);
    },
    get back() {
      return element(by.id(`${testID}.closeIcon`));
    },
    get entityCluster() {
      return entityClusterEntry();
    },
    get screen() {
      return element(by.id(testID));
    },
    scrollTo: async function (element: Detox.IndexableNativeElement) {
      await waitFor(element)
        .toBeVisible()
        .whileElement(by.id(testID))
        .scroll(100, 'down');
    },
    verifyAttributes: async function (attributes: Attributes<T>) {
      for (const key in attributes) {
        const attributeKey = key as T;
        const { label, value, onlyValueVisibility } = attributes[attributeKey]!;
        const attribute = this.attribute(attributeKey);
        await this.scrollTo(attribute.label);
        await expect(attribute.label).toHaveText(label);
        await this.scrollTo(attribute.value);
        if (value) {
          const expandable = value.length > VALUE_PREVIEW_LENGTH;
          if (expandable) {
            await this.scrollTo(attribute.expandButton);
            await attribute.expandButton.tap();
          }
          await expect(attribute.value).toHaveText(value);
        } else if (onlyValueVisibility) {
          await expect(attribute.value).toBeVisible();
        }
      }
    },
  };
}
