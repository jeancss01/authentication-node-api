import { type AddClientRepository } from '../../../../data/protocols/db/client/add-account-repository'
import { type LoadClientByClientIdRepository } from '../../../../data/protocols/db/client/load-client-by-client-id-repository'
import { type ClientModel } from '../../../../domain/models/client'
import { type AddClientModel } from '../../../../domain/usecases/add-client'
import { MongoHelper } from '../helpers/mongo-helpers'

export class ClientMongoRepository implements AddClientRepository, LoadClientByClientIdRepository {
  async add (clientData: AddClientModel): Promise<ClientModel> {
    const clientCollection = await MongoHelper.getCollection('clients')
    const result = await clientCollection.insertOne(clientData)
    const client = await clientCollection.findOne({ _id: result.insertedId })
    return MongoHelper.map(client)
  }

  async loadByClientId (clientId: string): Promise<ClientModel | null> {
    const clientCollection = await MongoHelper.getCollection('clients')
    const client = await clientCollection.findOne({ clientId })
    return client && MongoHelper.map(client)
  }
}
