import { type ClientModel } from '../../../domain/models/client'
import { type AddClientModel, type AddClient } from '../../../domain/usecases/add-client'
import { type AddClientRepository } from '../../protocols/db/client/add-account-repository'
import { type LoadClientByClientIdRepository } from '../../protocols/db/client/load-client-by-client-id-repository'

export class DbAddClient implements AddClient {
  constructor (
    private readonly addClientRepository: AddClientRepository,
    private readonly loadClientByClientIdRepository: LoadClientByClientIdRepository
  ) {}

  async add (clientData: AddClientModel): Promise<ClientModel> {
    const existingClient = await this.loadClientByClientIdRepository.loadByClientId(clientData.clientId)
    if (existingClient) {
      throw new Error('Client already exists with this clientId')
    }
    return await this.addClientRepository.add(clientData)
  }
}
