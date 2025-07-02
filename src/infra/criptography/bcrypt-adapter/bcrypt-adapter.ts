import type { HashComparer } from '../../../data/protocols/criptography/hash-comparer'
import type { Hasher } from '../../../data/protocols/criptography/hasher'
import bcrypt from 'bcrypt'

export class BcryptAdapter implements Hasher, HashComparer {
  private readonly salt: number = 12
  constructor (salt: number) {
    this.salt = salt
  }

  async createHash (value: string): Promise<string> {
    return await this.hash(value)
  }

  async hash (value: string): Promise<string> {
    return await bcrypt.hash(value, this.salt)
  }

  async compare (value: string, hash: string): Promise<boolean> {
    const isValid: boolean = await bcrypt.compare(value, hash)
    return isValid
  }
}
