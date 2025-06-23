import type { Authorization, AuthorizationModel } from '../../../domain/usecases/authorization'
import type { LoadAccountByEmailRepository } from '../../protocols/db/account/load-account-by-email-repository'
import type { LoadClientByClientIdRepository } from '../../protocols/db/client/load-client-by-client-id-repository'
import type { HashComparer } from '../../protocols/criptography/hash-comparer'
import type { Hasher } from '../../protocols/criptography/hasher'
import type { AddAuthCodeRepository } from '../../protocols/db/auth-code/add-auth-code-repository'

export class DbAuthorization implements Authorization {
  constructor (
    private readonly loadClientByClientIdRepository: LoadClientByClientIdRepository,
    private readonly loadAccountByEmailRepository: LoadAccountByEmailRepository,
    private readonly addAuthCodeRepository: AddAuthCodeRepository,
    private readonly hashComparer: HashComparer,
    private readonly hasher: Hasher
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
    const account = await this.loadAccountByEmailRepository.loadByEmail(authorization.email)
    if (account) {
      const isValid = await this.hashComparer.compare(authorization.password, String(account.password))
      if (isValid) {
        const code = await this.hasher.hash('')
        await this.addAuthCodeRepository.add({
          code,
          clientId: authorization.clientId,
          userId: account.id,
          codeChallenge: authorization.codeChallenge,
          codeChallengeMethod: authorization.codeChallengeMethod,
          expiresAt: new Date(Date.now() + 1000 * 60 * 10), // 10 minutes
          createdAt: new Date()
        })
        return `${authorization.redirectUri}?code=${code}`
      }
    }
    return null
  }
}
