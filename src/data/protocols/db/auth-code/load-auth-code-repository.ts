import { type AuthCodeModel } from '../../../../domain/models/auth-code'

export interface LoadAuthCodeRepository {
  load: (id: string) => Promise<AuthCodeModel | null>
}
