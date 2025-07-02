import type { RefreshTokenModel } from '../../../../domain/models/refresh-token'
import type { AddRefreshTokenModel } from '../../../../domain/usecases/add-refresh-token'

export interface AddRefreshTokenRepository {
  add: (data: AddRefreshTokenModel) => Promise<RefreshTokenModel>
}
