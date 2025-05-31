import { type Authentication, type AuthenticationModel } from '../../../domain/usecases/authentication'
import { type LoadAccountByEmailRepository } from '../../protocols/load-account-by-email-repository'

export class DbAuthentication implements Authentication {
  constructor (
    private readonly loadAccountByEmailRepository: LoadAccountByEmailRepository
  ) {}

  async auth (authentication: AuthenticationModel): Promise<string | null> {
    const account = await this.loadAccountByEmailRepository.load(authentication.email)
    if (account) {
      // Here you would typically verify the password and return a token
      return 'some_token' // Placeholder for token generation logic
    }
    return null
  }
}
