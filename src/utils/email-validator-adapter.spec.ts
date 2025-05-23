import { EmailValidatorAdapter } from './email-validator'

describe('EmailValidatorAdapter', () => {
  test('Should return false if validator returns false', () => {
    const sut = new EmailValidatorAdapter()
    // jest.spyOn(sut, 'isValid').mockReturnValueOnce(false)
    const isValid = sut.isValid('invalid_email')
    expect(isValid).toBe(false)
  })

//   test('Should return true if validator returns true', () => {
//     const sut = new EmailValidatorAdapter()
//     // jest.spyOn(sut, 'isValid').mockReturnValueOnce(true)
//     const isValid = sut.isValid('')
//   })
})
