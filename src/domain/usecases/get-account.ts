import { type AccountModel } from '../models/account'

export interface GetAccount {
  get: (accountId: string) => Promise<AccountModel | null>
}
