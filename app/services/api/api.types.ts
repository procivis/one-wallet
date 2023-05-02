import { GeneralApiProblem } from './api-problem';

export interface Invitation {
  connection_id: string;
  invitation: unknown;
  invitation_url: string;
}

export type GetInvitationResult = { kind: 'ok'; invitation: Invitation } | GeneralApiProblem;
