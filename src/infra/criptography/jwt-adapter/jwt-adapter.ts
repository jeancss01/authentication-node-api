import { type Decrypter } from '../../../data/protocols/criptography/decrypter'
import { type Encrypter } from '../../../data/protocols/criptography/encrypter'
import jwt from 'jsonwebtoken'

export class JwtAdapter implements Encrypter, Decrypter {
  constructor (private readonly secret: string) {}

  async encrypt (value: string, expiresIn: number): Promise<string> {
    const accessToken = jwt.sign({ id: value }, this.secret, { expiresIn })
    return accessToken
  }

  async decrypt (token: string): Promise<string> {
    const payload: any = jwt.verify(token, this.secret)
    return payload
  }
}
