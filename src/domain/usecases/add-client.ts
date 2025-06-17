import { type ClientModel } from '../models/client'

export interface AddClientModel {
  clientId: string
  clientSecret: string
  redirectUris: string[]
}

export interface AddClient {
  add: (clientData: AddClientModel) => Promise<ClientModel>
}
