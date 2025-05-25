import type { Encrypter } from '../../data/protocols/encrypter'
import bcrypt from 'bcrypt'

export class BcryptAdapter implements Encrypter {
  constructor (private readonly salt: number = 12) {}

  async encrypt (value: string): Promise<string> {
    await bcrypt.hash(value, 12)
    return await new Promise((resolve, reject) => { resolve('') })
  }
}
