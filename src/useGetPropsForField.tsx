import { useCallback } from 'react'
import { getField } from './schemaUtils'

export const buildEventMetadata = (
  values: any,
  validationResult: any,
  fieldName: any,
  fieldSchema: any,
  nestedFormEvent?: any,
  nextValue?: any
) => ({
  fieldName,
  fieldSchema,
  values,
  validationResult,
  nestedFormEvent,
  nextValue
})

export const useGetPropsForField = (props: any, mapError = (error: any) => error) => {
  const {
    values,
    validationResult = [false, {}],
    touched = {},
    visited = {},
    onChange = () => {},
    onFieldBlur = () => {},
    onFieldFocus = () => {},
    onFieldTouchedChange = () => {},
    onFieldVisitedChange = () => {}
  } = props
  const makeOnFieldChange = useCallback(
    ([name, field]) => (nextValue?: any) =>
      onChange(
        buildEventMetadata(values, validationResult, name, field, undefined, nextValue),
        (values: any) => ({ ...values, [name]: nextValue })
      ),
    [values, validationResult, onChange]
  )
  const makeOnFieldFocus = useCallback(
    ([name, field]) => () => {
      const eventMetadata = buildEventMetadata(values, validationResult, name, field)

      // Call the `onFieldVisitedChange` callback if the field was not visited before.
      if (!visited[name]) {
        onFieldVisitedChange(eventMetadata, (visited: any) => ({
          ...visited,
          [name]: true
        }))
      }

      return onFieldFocus(eventMetadata)
    },
    [values, validationResult, visited, onFieldFocus, onFieldVisitedChange]
  )
  const makeOnFieldBlur = useCallback(
    ([name, field]) => () => {
      const eventMetadata = buildEventMetadata(values, validationResult, name, field)

      // Call the `onFieldTouchedChange` callback the first time the field is touched.
      if (!touched[name]) {
        onFieldTouchedChange(eventMetadata, (touched: any) => ({
          ...touched,
          [name]: true
        }))
      }

      return onFieldBlur(eventMetadata)
    },
    [values, validationResult, touched, onFieldBlur, onFieldTouchedChange]
  )

  return useCallback(
    name => {
      const field = getField(props.schema, name)

      return {
        name,
        value: values[name],
        error: mapError(validationResult[1][name][1]),
        onChange: makeOnFieldChange([name, field]),
        onFocus: makeOnFieldFocus([name, field]),
        onBlur: makeOnFieldBlur([name, field])
      }
    },
    [props.schema, values, validationResult, makeOnFieldChange, makeOnFieldFocus, makeOnFieldBlur]
  )
}

export default useGetPropsForField
