export interface Encrypter {
  encrypt: (value: string, expiresIn: number) => Promise<string>
}
