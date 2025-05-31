import type { HashComparer } from '../../../data/protocols/criptography/hash-comparer'
import type { Hasher } from '../../../data/protocols/criptography/hasher'
import bcrypt from 'bcrypt'

export class BcryptAdapter implements Hasher, HashComparer {
  private readonly salt: number = 12
  constructor (salt: number) {
    this.salt = salt
  }

  async hash (value: string): Promise<string> {
    return await bcrypt.hash(value, 12)
  }

  async compare (value: string, hash: string): Promise<boolean> {
    const isValid: boolean = await bcrypt.compare(value, hash)
    return isValid
  }
}
