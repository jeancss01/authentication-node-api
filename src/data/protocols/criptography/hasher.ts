export interface Hasher {
  hash: (value: string) => Promise<string>
  createHash: (value: string) => Promise<string>
}
