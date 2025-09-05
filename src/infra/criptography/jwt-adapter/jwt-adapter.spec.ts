import jwt from 'jsonwebtoken'
import { JwtAdapter } from './jwt-adapter'

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn().mockResolvedValue('any_token'),
  verify: jest.fn().mockResolvedValue({ id: 'any_value' })
}))

const makeSut = (): JwtAdapter => {
  return new JwtAdapter('secret')
}

describe('JwtAdapter', () => {
  describe('sign', () => {
    test('should call sign with correct values', async () => {
      const sut = makeSut()
      const signSpy = jest.spyOn(jwt, 'sign')
      await sut.encrypt('any_value', 86400) // Assuming 1 day expiration
      expect(signSpy).toHaveBeenCalledWith({ id: 'any_value' }, 'secret', { expiresIn: 86400 })
    })

    test('should return a token on sign success', async () => {
      const sut = makeSut()
      const accessToken = await sut.encrypt('any_value', 86400)
      expect(accessToken).toBe('any_token')
    })

    test('should throw if sign throws', async () => {
      const sut = makeSut()
      jest.spyOn(jwt, 'sign').mockImplementationOnce(() => {
        throw new Error()
      })
      const promise = sut.encrypt('any_value', 86400)
      await expect(promise).rejects.toThrow()
    })
  })

  describe('verify', () => {
    test('should call verify with correct values', async () => {
      const sut = makeSut()
      const verifySpy = jest.spyOn(jwt, 'verify')
      await sut.decrypt('any_token')
      expect(verifySpy).toHaveBeenCalledWith('any_token', 'secret')
    })

    test('should return a user id on verify success', async () => {
      const sut = makeSut()
      const value = await sut.decrypt('any_token')
      expect(value).toEqual({ id: 'any_value' })
    })

    test('should throw if verify throws', async () => {
      const sut = makeSut()
      jest.spyOn(jwt, 'verify').mockImplementationOnce(() => {
        throw new Error()
      })
      const promise = sut.decrypt('any_token')
      await expect(promise).rejects.toThrow()
    })
  })
})
