export interface DeleteAuthCodeRepository {
  delete: (code: string, clientId: string) => Promise<void>
}
