import { ValidationComposite, RequiredFieldValidation } from '../../../presentation/helpers/validators'
import type { Validation } from '../../../presentation/protocols/validation'
import { makeGetAccountValidation } from './get-account-validation-factory'

jest.mock('../../../presentation/helpers/validators/validation-composite')

describe('GetAccountValidation Factory', () => {
  test('should call ValidationComposite with all validations', () => {
    makeGetAccountValidation()
    const validations: Validation[] = []
    for (const field of ['accountId']) {
      validations.push(new RequiredFieldValidation(field))
    }
    expect(ValidationComposite).toHaveBeenCalledWith(validations)
    expect(ValidationComposite).toHaveBeenCalledTimes(1)
  })
})
