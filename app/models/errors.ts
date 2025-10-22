export class IncompatibleKeyStorageError extends Error {
  constructor() {
    super('Incompatible key storage type');
    this.name = 'incompatibleKeyStorageType';

    Object.setPrototypeOf(this, IncompatibleKeyStorageError.prototype);
  }
}
