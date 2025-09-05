import { RequiredFieldValidation, ValidationComposite } from '../../../../presentation/helpers/validators'
import { makeTokenValidation } from './token-validation-factory'
jest.mock('../../../../presentation/helpers/validators/validation-composite')

describe('TokenValidation Factory', () => {
  test('should call ValidationComposite with all validations', () => {
    makeTokenValidation()
    const validations: any[] = []
    for (const field of ['grantType']) {
      validations.push(new RequiredFieldValidation(field))
    }
    expect(ValidationComposite).toHaveBeenCalledTimes(1)
    expect(ValidationComposite).toHaveBeenCalledWith(validations)
  })
})
