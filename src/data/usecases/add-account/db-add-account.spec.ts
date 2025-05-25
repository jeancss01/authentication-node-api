import type { AccountModel, AddAccountModel, Encrypter, AddAccountRepository } from './db-add-account-protocols'
import { DbAddAccount } from './db-add-account'

const makeEncrypter = (): Encrypter => {
  class EncrypterStub implements Encrypter {
    async encrypt (value: string): Promise<string> {
      return await new Promise(resolve => { resolve('hashed_password') })
    }
  }
  return new EncrypterStub()
}

const makeAddAccountRepository = (): AddAccountRepository => {
  class AddAccountRepositoryStub implements AddAccountRepository {
    async add (addAccountModel: AddAccountModel): Promise<AccountModel> {
      const fakeAccount: AccountModel = {
        id: 'valid_id',
        name: addAccountModel.name,
        email: addAccountModel.email,
        password: 'hashed_password'
      }
      return await new Promise(resolve => { resolve(fakeAccount) })
    }
  }
  return new AddAccountRepositoryStub()
}

interface SutTypes {
  sut: DbAddAccount
  encrypterStub: Encrypter
  addAccountRepositoryStub: AddAccountRepository
}

const makeSut = (): SutTypes => {
  const encrypterStub = makeEncrypter()
  const addAccountRepositoryStub = makeAddAccountRepository()
  const sut = new DbAddAccount(encrypterStub, addAccountRepositoryStub)
  return {
    sut,
    encrypterStub,
    addAccountRepositoryStub
  }
}

describe('DbAddAccount Usecase', () => {
  test('Should call Encrypter with correct password', async () => {
    const { sut, encrypterStub } = makeSut()
    const encrypterSpy = jest.spyOn(encrypterStub, 'encrypt')
    const accountData = {
      name: 'any_name',
      email: 'any@email.com',
      password: 'any_password'
    }
    await sut.add(accountData)
    expect(encrypterSpy).toHaveBeenCalledWith('any_password')
  })

  test('Should throw if Encrypter with throws', async () => {
    const { sut, encrypterStub } = makeSut()
    jest.spyOn(encrypterStub, 'encrypt').mockResolvedValueOnce(new Promise((resolve, reject) => { reject(new Error()) }))
    const accountData = {
      name: 'any_name',
      email: 'any@email.com',
      password: 'any_password'
    }
    const promise = sut.add(accountData)
    await expect(promise).rejects.toThrow()
  })

  test('Should call AddAccountRepository with correct password values', async () => {
    const { sut, addAccountRepositoryStub } = makeSut()
    const addSpy = jest.spyOn(addAccountRepositoryStub, 'add')
    const accountData = {
      name: 'any_name',
      email: 'any@email.com',
      password: 'any_password'
    }
    await sut.add(accountData)
    expect(addSpy).toHaveBeenCalledWith({
      name: 'any_name',
      email: 'any@email.com',
      password: 'hashed_password'
    })
  })

  test('Should throw if addAccountRepository with throws', async () => {
    const { sut, addAccountRepositoryStub } = makeSut()
    jest.spyOn(addAccountRepositoryStub, 'add').mockResolvedValueOnce(new Promise((resolve, reject) => { reject(new Error()) }))
    const accountData = {
      name: 'any_name',
      email: 'any@email.com',
      password: 'any_password'
    }
    const promise = sut.add(accountData)
    await expect(promise).rejects.toThrow()
  })

  test('Should returns an account on success', async () => {
    const { sut } = makeSut()
    const accountData = {
      name: 'any_name',
      email: 'any@email.com',
      password: 'any_password'
    }
    const account = await sut.add(accountData)
    expect(account).toEqual({
      id: 'valid_id',
      name: 'any_name',
      email: 'any@email.com',
      password: 'hashed_password'
    })
  })
})
