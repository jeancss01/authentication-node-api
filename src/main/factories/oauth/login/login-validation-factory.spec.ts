import { RequiredFieldValidation, ValidationComposite, EmailValidation } from '../../../../presentation/helpers/validators'
import { type EmailValidator } from '../../../../presentation/protocols/email-validator'
import type { Validation } from '../../../../presentation/protocols/validation'
import { makeLoginValidation } from '../../login/login-validation-factory'

jest.mock('../../../../presentation/helpers/validators/validation-composite')

const makeEmailValidator = (): EmailValidator => {
  class EmailValidatorStub implements EmailValidator {
    isValid (email: string): boolean {
      return true
    }
  }
  return new EmailValidatorStub()
}

describe('LoginValidation Factory', () => {
  test('should call ValidationComposite with all validations', () => {
    makeLoginValidation()
    const validations: Validation[] = []
    for (const field of ['email', 'password']) {
      validations.push(new RequiredFieldValidation(field))
    }
    validations.push(new EmailValidation('email', makeEmailValidator()))
    expect(ValidationComposite).toHaveBeenCalledTimes(1)
    expect(ValidationComposite).toHaveBeenCalledWith(validations)
  })
})
