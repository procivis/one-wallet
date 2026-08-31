import {
  CoreConfig,
  PresentationDefinitionTransactionData,
  PresentationDefinitionV2,
  TransactionDataFeature,
} from '@procivis/react-native-one-core';

// transaction data id -> credential query id authorizing it
export type TransactionDataAssignment = Record<string, string>;

export interface TransactionDataAssignmentContext {
  // queries with a credential to present, preferred when assigning
  isQueryAvailable?: (queryId: string) => boolean;
  // queries that may authorize any number of entries (DCQL `multiple`)
  isQueryUnlimited: (queryId: string) => boolean;
  transactionData: PresentationDefinitionTransactionData[];
  // types whose entries can share one credential
  typeAllowsSharedCredential: (type: string) => boolean;
}

// gives each entry one of its candidate queries, no query twice; undefined if impossible
const matchDistinctQueries = (
  candidates: string[][],
  isQueryUnlimited: (queryId: string) => boolean,
): string[] | undefined => {
  const assigned: string[] = [];
  const holder = new Map<string, number>();

  // places `entry` on a free candidate, or on a taken one whose holder can be moved elsewhere
  const place = (entry: number, considered: Set<string>): boolean => {
    for (const queryId of candidates[entry]) {
      if (isQueryUnlimited(queryId)) {
        assigned[entry] = queryId;
        return true;
      }
      if (considered.has(queryId)) {
        continue;
      }
      considered.add(queryId);
      const heldBy = holder.get(queryId);
      if (heldBy === undefined || place(heldBy, considered)) {
        holder.set(queryId, entry);
        assigned[entry] = queryId;
        return true;
      }
    }
    return false;
  };

  for (let entry = 0; entry < candidates.length; entry++) {
    if (!place(entry, new Set())) {
      return undefined;
    }
  }
  return assigned;
};

const candidatesFor = (
  entry: PresentationDefinitionTransactionData,
  pinned: TransactionDataAssignment,
  isQueryAvailable?: (queryId: string) => boolean,
): string[] => {
  const pin = pinned[entry.id];
  if (pin) {
    return [pin];
  }
  if (!isQueryAvailable) {
    return entry.credentialQueryIds;
  }
  return [
    ...entry.credentialQueryIds.filter(isQueryAvailable),
    ...entry.credentialQueryIds.filter((queryId) => !isQueryAvailable(queryId)),
  ];
};

const groupByType = (
  transactionData: PresentationDefinitionTransactionData[],
) =>
  transactionData.reduce<
    Record<string, PresentationDefinitionTransactionData[]>
  >((acc, entry) => {
    acc[entry.type] = [...(acc[entry.type] ?? []), entry];
    return acc;
  }, {});

const tryAssignTransactionData = (
  {
    isQueryAvailable,
    isQueryUnlimited,
    transactionData,
    typeAllowsSharedCredential,
  }: TransactionDataAssignmentContext,
  pinned: TransactionDataAssignment,
): TransactionDataAssignment | undefined => {
  const assignment: TransactionDataAssignment = {};
  for (const [type, entries] of Object.entries(groupByType(transactionData))) {
    const candidates = entries.map((entry) =>
      candidatesFor(entry, pinned, isQueryAvailable),
    );
    // entries of a type sharing one credential never compete; only same-type entries do
    const queryIds = typeAllowsSharedCredential(type)
      ? candidates.map((queryIds) => queryIds[0])
      : matchDistinctQueries(candidates, isQueryUnlimited);
    if (!queryIds) {
      return undefined;
    }
    entries.forEach((entry, index) => {
      if (queryIds[index]) {
        assignment[entry.id] = queryIds[index];
      }
    });
  }
  return assignment;
};

// keeps the pinned choices and places the other entries so that no credential
// authorizes two entries of the same type, unless the type or query allows it
export const assignTransactionData = (
  context: TransactionDataAssignmentContext,
  pinned: TransactionDataAssignment = {},
): TransactionDataAssignment =>
  tryAssignTransactionData(context, pinned) ??
  // unsatisfiable pins: keep them and give the rest their preferred query
  Object.fromEntries(
    context.transactionData.map((entry) => [
      entry.id,
      candidatesFor(entry, pinned, context.isQueryAvailable)[0],
    ]),
  );

// a same-type entry pinned to the chosen query is released and re-assigned
export const pinTransactionDataQuery = (
  {
    isQueryUnlimited,
    transactionData,
    typeAllowsSharedCredential,
  }: TransactionDataAssignmentContext,
  pinned: TransactionDataAssignment,
  transactionId: string,
  queryId: string,
): TransactionDataAssignment => {
  const entry = transactionData.find(({ id }) => id === transactionId);
  const conflicting =
    entry &&
    !typeAllowsSharedCredential(entry.type) &&
    !isQueryUnlimited(queryId);
  const released = Object.fromEntries(
    Object.entries(pinned).filter(
      ([id, pin]) =>
        id !== transactionId &&
        !(
          conflicting &&
          pin === queryId &&
          transactionData.find((other) => other.id === id)?.type === entry.type
        ),
    ),
  );
  return { ...released, [transactionId]: queryId };
};

export const canPinTransactionDataQuery = (
  context: TransactionDataAssignmentContext,
  pinned: TransactionDataAssignment,
  transactionId: string,
  queryId: string,
): boolean =>
  tryAssignTransactionData(
    context,
    pinTransactionDataQuery(context, pinned, transactionId, queryId),
  ) !== undefined;

export const presentationDefinitionTransactionDataContext = (
  presentationDefinition: PresentationDefinitionV2,
  config: CoreConfig | undefined,
): TransactionDataAssignmentContext => ({
  isQueryAvailable: (queryId) => {
    const credentialQuery =
      presentationDefinition.credentialQueries[queryId]
        ?.credentialOrFailureHint;
    return (
      credentialQuery?.type_ === 'APPLICABLE_CREDENTIALS' &&
      credentialQuery.applicableCredentials.length > 0
    );
  },
  isQueryUnlimited: (queryId) =>
    Boolean(presentationDefinition.credentialQueries[queryId]?.multiple),
  transactionData: presentationDefinition.transactionData,
  typeAllowsSharedCredential: (type) =>
    Boolean(
      config?.transactionDataProvider[type]?.capabilities?.features.includes(
        TransactionDataFeature.SupportsMultipleTxDataPerPresentation,
      ),
    ),
});
