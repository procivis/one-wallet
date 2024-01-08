import { ApiResponse, ApisauceInstance, create } from 'apisauce';

import { config } from '../../config';
import * as Types from './api.types';
import { getGeneralApiProblem } from './api-problem';

/**
 * The options used to configure the API.
 */
export interface ApiConfig {
  /**
   * Milliseconds before we timeout the request.
   */
  timeout: number;

  /**
   * The URL of the api.
   */
  url: string;
}

/**
 * Manages all requests to the API.
 */
export class Api {
  /**
   * The underlying apisauce instance which performs the requests.
   */
  apisauce: ApisauceInstance;

  /**
   * Configurable options.
   */
  config: ApiConfig;

  /**
   * Creates the api.
   *
   * @param config The configuration to use.
   */
  constructor(url: string) {
    this.config = {
      timeout: 10000,
      url,
    };

    // construct the apisauce instance
    this.apisauce = create({
      baseURL: this.config.url,
      headers: {
        Accept: 'application/json',
      },
      timeout: this.config.timeout,
    });
  }

  /**
   * Gets Aries agent invitation.
   */
  async createInvitation(): Promise<Types.GetInvitationResult> {
    // make the api call
    const response: ApiResponse<any> = await this.apisauce.post(
      config.backendConfig.endpoints.onboardingInvitation,
    );

    // the typical ways to die when calling an api
    if (!response.ok) {
      const problem = getGeneralApiProblem(response);
      if (problem) {
        return problem;
      }
    }

    // transform the data into the format we are expecting
    try {
      const resultInvitation: Types.Invitation = {
        connection_id: response.data.connection_id,
        invitation: response.data.invitation,
        invitation_url: response.data.invitation_url,
      };
      return { invitation: resultInvitation, kind: 'ok' };
    } catch {
      return { kind: 'bad-data' };
    }
  }
}
