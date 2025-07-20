import { type AccountModel } from '../../../../domain/models/account'

export interface LoadAccountByIdRepository {
  loadById: (id: string, role?: string) => Promise<AccountModel | null>
}
