import defaultValidate from './validate'
import { getFields, isForm } from './schemaUtils'

export type ValidationResult = [true] | [false, any]

export const stateFromSchema = (schema: any, state: any = {}) =>
  getFields(schema).reduce((result: any, [name, field]: any) => {
    return {
      ...result,
      [name]: isForm(field) ? stateFromSchema(field, state[name]) : state[name]
    }
  }, {})

export const getInitialValues = (schema: any, initialValues: any = {}) =>
  stateFromSchema(schema, initialValues)

const populateRecursively = (schema: any, value: any) =>
  getFields(schema).reduce(
    (result: any, [name, field]: any) => ({
      ...result,
      [name]: isForm(field) ? populateRecursively(field, value) : value
    }),
    {}
  )

export const getInitialTouched = (schema: any, validateOnInit: any) =>
  populateRecursively(schema, validateOnInit)

export const getInitialVisited = (schema: any) => populateRecursively(schema, false)

export const getAllFieldsTouched = (schema: any) => populateRecursively(schema, true)

export const mergeAdditionalErrors = (
  validationResult: ValidationResult = [true],
  additionalErrors: any = {}
): ValidationResult => {
  return Object.keys(additionalErrors).reduce(([isValid, errors]: ValidationResult, errorKey) => {
    const error = additionalErrors[errorKey]
    const additionalValidationResult =
      typeof error === 'object'
        ? mergeAdditionalErrors(errors?.[errorKey], additionalErrors[errorKey])
        : error
        ? [false, error]
        : [true]

    return [
      isValid && additionalValidationResult[0],
      {
        ...errors,
        [errorKey]: additionalValidationResult
      }
    ] as ValidationResult
  }, validationResult)
}

export const getValidationResult = (
  schema: any,
  values: any,
  touched: any,
  additionalErrors: any,
  validate = defaultValidate
) => {
  const validationResult = validate(schema, values, touched)
  return additionalErrors !== undefined
    ? mergeAdditionalErrors(validationResult, additionalErrors)
    : validationResult
}
