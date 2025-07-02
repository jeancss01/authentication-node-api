import { type ClientModel } from '../../../../domain/models/client'

export interface LoadClientByClientIdRepository {
  loadByClientId: (clientId: string) => Promise<ClientModel | null>
}
