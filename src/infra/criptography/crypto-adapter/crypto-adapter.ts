import type { Hasher } from '../../../data/protocols/criptography/hasher'
import crypto from 'crypto'

export class CryptoAdapter implements Hasher {
  async hash (value: string): Promise<string> {
    return crypto.randomBytes(32).toString('hex')
  }

  async createHash (value: string): Promise<string> {
    return crypto.createHash('sha256').update(value).digest('hex')
  }
}
