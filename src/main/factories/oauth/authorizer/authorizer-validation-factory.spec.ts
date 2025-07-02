import { RequiredFieldValidation, ValidationComposite } from '../../../../presentation/helpers/validators'
import { makeAuthorizationValidation } from './authorizer-validation-factory'

jest.mock('../../../../presentation/helpers/validators/validation-composite')

describe('AuthorizationValidation Factory', () => {
  test('should call ValidationComposite with all validations', () => {
    makeAuthorizationValidation()
    const validations: any[] = []
    for (const field of ['clientId', 'redirectUri', 'codeChallenge', 'codeChallengeMethod']) {
      validations.push(new RequiredFieldValidation(field))
    }
    expect(ValidationComposite).toHaveBeenCalledTimes(1)
    expect(ValidationComposite).toHaveBeenCalledWith(validations)
  })
})
