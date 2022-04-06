import { getFields, isForm } from './schemaUtils'

export const Errors = {
  Required: 'Required',
  InvalidType: 'InvalidType',
  FailedRegex: 'FailedRegex',
  Unexpected: 'Unexpected'
}

const typeCheckers: any = {
  number: (value: any) => Boolean(parseInt(value, 10))
}

const identity = [true]

export const identityValidator = (result = identity) => result

export const requiredValidator = (result: any, value: any) =>
  !value ? [false, Errors.Required] : identityValidator(result)

export const createTypeValidator = (type: any) => (result: any, value: any) => {
  const typeChecker = typeCheckers[type]

  return typeChecker !== undefined && !typeChecker(value)
    ? [false, Errors.InvalidType]
    : identityValidator(result)
}

export const createRegexValidator = (regex: any, error: any = Errors.FailedRegex) => (
  result: any,
  value: any
) => (!regex.test(value) ? [false, error] : identityValidator(result))

/**
 * Validates a field value.
 *
 * @param {Object} field - Field schema.
 * @param {any} value - Field value.
 * @param {Object} metadata - Configurations and metadata for validations (validators and other fields data).
 * @returns {Array} Array with a boolean that flags the validation result and the error as the second element.
 */
export const validateField = (field: any, value: any, metadata: any) => {
  const { validators = [identityValidator] } = field

  return validators.reduce(
    (result: any, validator: any) => validator(result, value, field, metadata),
    identity
  )
}

/**
 * Validates a fields array.
 *
 * To think about: we could add an additional argument that would carry the root form values and feed them to
 * all the nested forms' validations. Didn't add it yet, because that would make the nested forms less modular,
 * as they'd then have to be aware of implementation details of the outer form. The current solution for this
 * use case now would be to map the form schema fields adding them the additional context specific validations
 * on each context.
 */
export default function validate(schema: any, values: any = {}, touched: any = {}) {
  return getFields(schema).reduce(
    ([isValid, fieldValidationResults]: any, [fieldName, field]: any) => {
      const wasFieldTouched = Boolean(touched[fieldName])

      // We only validate touched fields.
      const validationResult = isForm(field)
        ? validate(field, values[fieldName], touched[fieldName])
        : wasFieldTouched
        ? validateField(field, values[fieldName], {
            fieldName,
            fields: getFields(schema),
            values
          })
        : identity

      return [
        isValid && validationResult[0],
        {
          ...fieldValidationResults,
          [fieldName]: validationResult
        }
      ]
    },
    [true, {}]
  )
}
