import validate from './validate'
import { getFields, isForm } from './schemaUtils'

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

export const getValidationResult = (
  schema: any,
  values: any,
  touched: any,
  additionalErrors: any
) => {
  const [isValid, errors] = validate(schema, values, touched)
  const allErrors = additionalErrors !== undefined ? { ...errors, ...additionalErrors } : errors

  return [isValid, allErrors]
}
