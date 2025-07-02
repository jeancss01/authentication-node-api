import { type AuthCodeModel } from '../../../../domain/models/auth-code'

export interface LoadAuthCodeRepository {
  load: (code: string, clientId: string) => Promise<AuthCodeModel | null>
}
