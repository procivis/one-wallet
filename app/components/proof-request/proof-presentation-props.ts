import { MutableRefObject } from 'react';

export type ProofPresentationProps = {
  onPresentationDefinitionLoaded: () => void;
  proofAccepted: MutableRefObject<boolean>;
};
