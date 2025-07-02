import type { AccountModel } from '../../../domain/models/account'
import type { GetAccount } from '../../../domain/usecases/get-account'
import type { GetAccountRepository } from '../../protocols/db/account/get-account-repository'

export class DbGetAccount implements GetAccount {
  constructor (
    private readonly getAccountRepository: GetAccountRepository
  ) {}

  async get (accountId: string): Promise<AccountModel | null> {
    const account = await this.getAccountRepository.get(accountId)
    return account ?? null
  }
}
