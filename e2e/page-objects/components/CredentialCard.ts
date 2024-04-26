// import { expect } from 'detox';

export default function CredentialCard(testID: string) {
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
    get element() {
      return element(by.id(testID));
    },
    get header() {
      const id = `${testID}.header`;
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
          return element(by.id(`${testID}.logo`));
        },
        get name() {
          return element(by.id(`${id}.name`));
        },
      };
    },
  };
}
