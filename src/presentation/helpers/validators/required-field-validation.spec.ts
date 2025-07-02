import { MissingParamError } from '../../errors/missing-param-error'
import { RequiredFieldValidation } from './required-field-validation'

const makeSut = (fieldName: string): RequiredFieldValidation => {
  return new RequiredFieldValidation(fieldName)
}

describe('RequiredFieldValidation', () => {
  test('should return a MissingParamError if validation fails', () => {
    const sut = makeSut('field')
    const error = sut.validate({ name: 'any_name' })
    expect(error).toEqual(new MissingParamError('field'))
  })

  test('should return null if validation succeeds', () => {
    const sut = makeSut('field')
    const error = sut.validate({ field: 'any_value' })
    expect(error).toBeNull()
  })
})
