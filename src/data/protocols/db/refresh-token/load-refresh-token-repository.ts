import type { RefreshTokenModel } from '../../../../domain/models/refresh-token'

export interface LoadRefreshTokenRepository {
  load: (token: string) => Promise<RefreshTokenModel | null>
}
