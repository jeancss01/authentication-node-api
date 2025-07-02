import { type ClientModel } from '../../../../domain/models/client'
import { type AddClientModel } from '../../../../domain/usecases/add-client'

export interface AddClientRepository {
  add: (clientData: AddClientModel) => Promise<ClientModel>
}
