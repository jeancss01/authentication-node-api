import type { AccountModel } from '../../../../domain/models/account'

export interface GetAccountRepository {
  get: (accountId: string) => Promise<AccountModel | null>
}
