import type { Authorization, AuthorizationModel } from '../../../../domain/usecases/oauth/authorize'
import type { LoadClientByClientIdRepository } from '../../../protocols/db/client/load-client-by-client-id-repository'

export class DbAuthorization implements Authorization {
  constructor (
    private readonly loadClientByClientIdRepository: LoadClientByClientIdRepository
  ) {}

  async authorize (authorization: AuthorizationModel): Promise<string | null> {
    const client = await this.loadClientByClientIdRepository.loadByClientId(authorization.clientId)
    if (!client) {
      // await this.clientMongoRepository.add({
      //   clientId: authorization.clientId,
      //   clientSecret: authorization.password,
      //   redirectUris: [authorization.redirectUri]
      // })
      return null
    }

    // Check if the redirect URI is valid for the client
    if (!client.redirectUris.includes(authorization.redirectUri)) {
      return null
    }

    return `${authorization.redirectUri}?client_id=${authorization.clientId}&redirect_uri=${authorization.redirectUri}&code_challenge=${authorization.codeChallenge}&code_challenge_method=${authorization.codeChallengeMethod}`
  }
}
