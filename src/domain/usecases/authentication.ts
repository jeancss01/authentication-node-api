export interface Authentication {
  auth: (authentication: AuthenticationModel) => Promise<string | null>
}
export interface AuthenticationModel {
  email: string
  password: string
}
