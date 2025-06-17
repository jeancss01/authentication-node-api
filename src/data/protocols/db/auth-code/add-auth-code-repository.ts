import { type AuthCodeModel } from '../../../../domain/models/auth-code'
import { type AddAuthCodeModel } from '../../../../domain/usecases/add-auth-code'

export interface AddAuthCodeRepository {
  add: (data: AddAuthCodeModel) => Promise<AuthCodeModel>
}
