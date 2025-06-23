import { CryptoAdapter } from './crypto-adapter'
import crypto from 'crypto'

jest.mock('crypto', () => ({
  randomBytes: jest.fn().mockReturnValue({
    toString: jest.fn().mockReturnValue('hashed_value')
  })
}))

const makeSut = (): CryptoAdapter => {
  return new CryptoAdapter()
}
describe('CryptoAdapter', () => {
  test('should call hash with correct value', async () => {
    const cryptoAdapter = makeSut()
    const hash = await cryptoAdapter.hash('some_value')
    expect(hash).toBe('hashed_value')
  })

  test('should throw if crypto throws', async () => {
    const cryptoAdapter = makeSut()
    jest.spyOn(crypto, 'randomBytes').mockImplementationOnce(() => {
      throw new Error()
    })
    await expect(cryptoAdapter.hash('some_value')).rejects.toThrow()
  })
})
