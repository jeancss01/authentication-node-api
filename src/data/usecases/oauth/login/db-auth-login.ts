import type { OauthLogin, OauthLoginModel } from '../../../../domain/usecases/oauth/login'
import type { LoadAccountByEmailRepository } from '../../../protocols/db/account/load-account-by-email-repository'
import type { HashComparer } from '../../../protocols/criptography/hash-comparer'

export class DbAuthLogin implements OauthLogin {
  constructor (
    private readonly loadAccountByEmailRepository: LoadAccountByEmailRepository,
    private readonly hashComparer: HashComparer
  ) {}

  async auth (authorization: OauthLoginModel): Promise<string | null> {
    const account = await this.loadAccountByEmailRepository.loadByEmail(authorization.email)
    if (!account) {
      // Account not found
      return null
    }

    // Compare the provided password with the stored hashed password
    const isValid = await this.hashComparer.compare(authorization.password, account.password)
    if (!isValid) {
      // Invalid password
      return null
    }
    return account.id
  }
}
