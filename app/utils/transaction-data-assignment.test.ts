import {
  assignTransactionData,
  canPinTransactionDataQuery,
  pinTransactionDataQuery,
  TransactionDataAssignmentContext,
} from './transaction-data-assignment';

const context = (
  transactionData: TransactionDataAssignmentContext['transactionData'],
  overrides: Partial<TransactionDataAssignmentContext> = {},
): TransactionDataAssignmentContext => ({
  isQueryUnlimited: () => false,
  transactionData,
  typeAllowsSharedCredential: () => false,
  ...overrides,
});

// one entry offering two queries, one entry restricted to the second
const qes = context([
  { credentialQueryIds: ['q1', 'q2'], id: 'tx1', type: 'QES_APPROVAL' },
  { credentialQueryIds: ['q2'], id: 'tx2', type: 'QES_APPROVAL' },
]);

describe('assignTransactionData', () => {
  it('gives same-type entries distinct queries', () => {
    expect(assignTransactionData(qes)).toEqual({ tx1: 'q1', tx2: 'q2' });
  });

  it('moves a free entry away from a pinned query', () => {
    const swapped = context([
      { credentialQueryIds: ['q1', 'q2'], id: 'tx1', type: 'QES_APPROVAL' },
      { credentialQueryIds: ['q1', 'q2'], id: 'tx2', type: 'QES_APPROVAL' },
    ]);
    expect(assignTransactionData(swapped, { tx2: 'q1' })).toEqual({
      tx1: 'q2',
      tx2: 'q1',
    });
  });

  it('lets different types share a query', () => {
    const mixed = context([
      { credentialQueryIds: ['q1'], id: 'tx1', type: 'QES_APPROVAL' },
      {
        credentialQueryIds: ['q1'],
        id: 'tx2',
        type: 'SCA_PAYMENT_CONFIRMATION',
      },
    ]);
    expect(assignTransactionData(mixed)).toEqual({ tx1: 'q1', tx2: 'q1' });
  });

  it('lets entries of a type supporting multiple entries share a query', () => {
    const sca = context(
      [
        { credentialQueryIds: ['q1', 'q2'], id: 'tx1', type: 'SCA' },
        { credentialQueryIds: ['q1', 'q2'], id: 'tx2', type: 'SCA' },
      ],
      { typeAllowsSharedCredential: (type) => type === 'SCA' },
    );
    expect(assignTransactionData(sca)).toEqual({ tx1: 'q1', tx2: 'q1' });
  });

  it('lets entries share a query the verifier accepts multiple credentials for', () => {
    const multiple = context(
      [
        { credentialQueryIds: ['q1'], id: 'tx1', type: 'QES_APPROVAL' },
        { credentialQueryIds: ['q1'], id: 'tx2', type: 'QES_APPROVAL' },
      ],
      { isQueryUnlimited: (queryId) => queryId === 'q1' },
    );
    expect(assignTransactionData(multiple)).toEqual({ tx1: 'q1', tx2: 'q1' });
  });

  it('prefers queries with a credential to present', () => {
    const missing = context(
      [{ credentialQueryIds: ['q1', 'q2'], id: 'tx1', type: 'QES_APPROVAL' }],
      { isQueryAvailable: (queryId) => queryId === 'q2' },
    );
    expect(assignTransactionData(missing)).toEqual({ tx1: 'q2' });
  });

  it('keeps unsatisfiable pins and falls back for the rest', () => {
    expect(assignTransactionData(qes, { tx1: 'q2', tx2: 'q2' })).toEqual({
      tx1: 'q2',
      tx2: 'q2',
    });
  });
});

describe('pinTransactionDataQuery', () => {
  it('releases a same-type pin on the chosen query', () => {
    expect(pinTransactionDataQuery(qes, { tx2: 'q2' }, 'tx1', 'q2')).toEqual({
      tx1: 'q2',
    });
  });

  it('keeps pins of other types on the chosen query', () => {
    const mixed = context([
      { credentialQueryIds: ['q1'], id: 'tx1', type: 'QES_APPROVAL' },
      {
        credentialQueryIds: ['q1'],
        id: 'tx2',
        type: 'SCA_PAYMENT_CONFIRMATION',
      },
    ]);
    expect(pinTransactionDataQuery(mixed, { tx2: 'q1' }, 'tx1', 'q1')).toEqual({
      tx1: 'q1',
      tx2: 'q1',
    });
  });
});

describe('canPinTransactionDataQuery', () => {
  it('rejects a query leaving another entry without a credential', () => {
    expect(canPinTransactionDataQuery(qes, {}, 'tx1', 'q2')).toBe(false);
    expect(canPinTransactionDataQuery(qes, {}, 'tx1', 'q1')).toBe(true);
  });

  it('accepts a query when the other entry can move', () => {
    const swapped = context([
      { credentialQueryIds: ['q1', 'q2'], id: 'tx1', type: 'QES_APPROVAL' },
      { credentialQueryIds: ['q1', 'q2'], id: 'tx2', type: 'QES_APPROVAL' },
    ]);
    expect(
      canPinTransactionDataQuery(swapped, { tx2: 'q1' }, 'tx1', 'q1'),
    ).toBe(true);
  });

  it('rejects a query when too many entries compete for it', () => {
    const crowded = context([
      { credentialQueryIds: ['q1', 'q2'], id: 'tx1', type: 'QES_APPROVAL' },
      { credentialQueryIds: ['q1', 'q2'], id: 'tx2', type: 'QES_APPROVAL' },
      {
        credentialQueryIds: ['q1', 'q2', 'q3'],
        id: 'tx3',
        type: 'QES_APPROVAL',
      },
    ]);
    expect(canPinTransactionDataQuery(crowded, {}, 'tx3', 'q1')).toBe(false);
    expect(canPinTransactionDataQuery(crowded, {}, 'tx3', 'q3')).toBe(true);
  });
});
