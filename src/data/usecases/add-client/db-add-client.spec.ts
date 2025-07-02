import { type ClientModel } from '../../../domain/models/client'
import { type AddClientModel } from '../../../domain/usecases/add-client'
import { type AddClientRepository } from '../../protocols/db/client/add-account-repository'
import { type LoadClientByClientIdRepository } from '../../protocols/db/client/load-client-by-client-id-repository'
import { DbAddClient } from './db-add-client'

const makeFakeClientModel = (): ClientModel => ({
  id: 'any_id',
  clientId: 'any_client_id',
  clientSecret: 'any_client_secret',
  redirectUris: ['http://any_redirect_uri.com']
})

const makeFakeClientData = (): AddClientModel => ({
  clientId: 'any_client_id',
  clientSecret: 'any_client_secret',
  redirectUris: ['http://any_redirect_uri.com']
})

const makeAddClientRepositoryStub = (): AddClientRepository => {
  class AddClientRepositoryStub implements AddClientRepository {
    async add (clientData: AddClientModel): Promise<ClientModel> {
      return await new Promise(resolve => { resolve(makeFakeClientModel()) })
    }
  }
  return new AddClientRepositoryStub()
}

const makeLoadClientByClientIdRepositoryStub = (): LoadClientByClientIdRepository => {
  class LoadClientByClientIdRepositoryStub implements LoadClientByClientIdRepository {
    async loadByClientId (clientId: string): Promise<ClientModel | null> {
      return await new Promise(resolve => { resolve(null) })
    }
  }
  return new LoadClientByClientIdRepositoryStub()
}

interface SutTypes {
  sut: DbAddClient
  addClientRepositoryStub: AddClientRepository
  loadClientByClientIdRepositoryStub: LoadClientByClientIdRepository
}
const makeSut = (): SutTypes => {
  const addClientRepositoryStub = makeAddClientRepositoryStub()
  const loadClientByClientIdRepositoryStub = makeLoadClientByClientIdRepositoryStub()
  const sut = new DbAddClient(addClientRepositoryStub, loadClientByClientIdRepositoryStub)
  return {
    sut,
    addClientRepositoryStub,
    loadClientByClientIdRepositoryStub
  }
}
describe('DbAddClient Usecase', () => {
  test('Should call AddClientRepository with correct values', async () => {
    const { sut, addClientRepositoryStub } = makeSut()
    const addSpy = jest.spyOn(addClientRepositoryStub, 'add')
    const clientData = makeFakeClientData()
    await sut.add(clientData)
    expect(addSpy).toHaveBeenCalledWith(clientData)
  })
  test('Should throw if AddClientRepository throws', async () => {
    const { sut, addClientRepositoryStub } = makeSut()
    jest.spyOn(addClientRepositoryStub, 'add').mockImplementationOnce(() => {
      throw new Error()
    })
    const clientData = makeFakeClientData()
    await expect(sut.add(clientData)).rejects.toThrow()
  })

  test('Should return a client on add success', async () => {
    const { sut } = makeSut()
    const clientData = makeFakeClientData()
    const client = await sut.add(clientData)
    expect(client).toEqual(makeFakeClientModel())
  })
  test('Should throw if client already exists with the same clientId', async () => {
    const { sut, loadClientByClientIdRepositoryStub } = makeSut()
    jest.spyOn(loadClientByClientIdRepositoryStub, 'loadByClientId').mockResolvedValueOnce(makeFakeClientModel())
    const clientData = makeFakeClientData()
    await expect(sut.add(clientData)).rejects.toThrow(new Error('Client already exists with this clientId'))
  })
})
