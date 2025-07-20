import { type AccountModel } from '../../../domain/models/account'
import { type LoadAccountByToken } from '../../../domain/usecases/load-account-by-token'
import { type Decrypter } from '../../protocols/criptography/decrypter'
import { type LoadAccountByIdRepository } from '../../protocols/db/account/load-account-by-token-repository'

export class DbLoadAccountByToken implements LoadAccountByToken {
  constructor (
    private readonly decrypter: Decrypter,
    private readonly LoadAccountByIdRepository: LoadAccountByIdRepository
  ) {}

  async load (token: string, role?: string): Promise<AccountModel | null> {
    const decryptedValue = await this.decrypter.decrypt(token)
    if (decryptedValue) {
      return await this.LoadAccountByIdRepository.loadById(decryptedValue, role)
    }
    return null
  }
}
