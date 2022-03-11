import { useCallback, useState, useMemo } from 'react'
import {
  getAllFieldsTouched,
  getInitialValues,
  getInitialTouched,
  getValidationResult,
  getInitialVisited,
  stateFromSchema
} from './utils'
import validate from './validate'

/**
 * The `useController` hook allows the parent component to control all its state and, in that case, be
 * completely stateless, with validation being the only feature it adds to the low level StatelessForm.
 * It is also possible to opt-in only some of the data properties (values, errors, touched and visited)
 * to be stored by the component.
 *
 * NOTE: error messages in DEV to when the owner component changes one of the data properties between
 * controlled and uncontrolled.
 */
const useController = ({
  schema,
  initialValues,
  validateOnInit = false,
  additionalErrors,
  // All form state goes in these 3 hooks:
  /* eslint-disable react-hooks/rules-of-hooks */
  valuesStateHook: [values = stateFromSchema(schema), baseSetValues, isNestedFormValues] = useState(
    getInitialValues(schema, initialValues)
  ),
  touchedStateHook: [
    touched = stateFromSchema(schema),
    baseSetTouched,
    isNestedFormTouched
  ] = useState(getInitialTouched(schema, validateOnInit)),
  visitedStateHook: [
    visited = stateFromSchema(schema),
    baseSetVisited,
    isNestedFormVisited
  ] = useState(getInitialVisited(schema)),
  /* eslint-enable react-hooks/rules-of-hooks */
  validationResult = getValidationResult(schema, values, touched, additionalErrors),
  onFieldTouch: baseOnFieldTouch = () => {},
  onFieldVisit: baseOnFieldVisit = () => {},
  onChange: baseOnChange = () => {},
  onSubmit: baseOnSubmit = () => {},
  onFieldBlur = () => {},
  onFieldFocus = () => {}
}: any) => {
  /**
   * Wrapper for setValues state updater to only bubble events on nested form changes.
   */
  const setValues = useMemo(
    () =>
      isNestedFormValues
        ? baseSetValues
        : (reducer: any, ...args: any) => baseSetValues(reducer, ...args),
    [baseSetValues, isNestedFormValues]
  )

  /**
   * Wrapper for setTouched state updater to only bubble events on nested form changes.
   */
  const setTouched = useMemo(
    () =>
      isNestedFormTouched
        ? baseSetTouched
        : (reducer: any, ...args: any) => baseSetTouched(reducer, ...args),
    [baseSetTouched, isNestedFormTouched]
  )

  /**
   * Wrapper for setVisited state updater to only bubble events on nested form changes.
   */
  const setVisited = useMemo(
    () =>
      isNestedFormVisited
        ? baseSetVisited
        : (reducer: any, ...args: any) => baseSetVisited(reducer, ...args),
    [baseSetVisited, isNestedFormVisited]
  )

  /**
   * Form field touch handler.
   */
  const onFieldTouchedChange = useCallback(
    (eventMetadata, reducer, ...rest) => {
      setTouched(reducer, eventMetadata)
      baseOnFieldTouch(eventMetadata, ...rest)
    },
    [baseOnFieldTouch, setTouched]
  )

  /**
   * Form field visit handler.
   */
  const onFieldVisitedChange = useCallback(
    (eventMetadata, reducer, ...rest) => {
      setVisited(reducer, eventMetadata)
      baseOnFieldVisit(eventMetadata, ...rest)
    },
    [baseOnFieldVisit, setVisited]
  )

  /**
   * Form changes handler.
   */
  const onChange = useCallback(
    (eventMetadata, reducer, _values, ...rest) => {
      setValues(reducer, eventMetadata)
      baseOnChange(eventMetadata, ...rest)
    },
    [baseOnChange, setValues]
  )

  /**
   * Form submit handler.
   */
  const onSubmit = useMemo(
    () =>
      // Bypass by default when in a nested form.
      isNestedFormValues
        ? baseOnSubmit
        : (...rest: any) => {
            // When the submit method if called, we touch all fields to make them validatable.
            const touched = getAllFieldsTouched(schema)
            const [isValid] = validate(schema, values, touched)

            if (isValid) {
              baseOnSubmit(values, ...rest)
            }

            setTouched(() => touched)
          },
    [isNestedFormValues, baseOnSubmit, schema, setTouched, values]
  )

  return {
    schema,
    onFieldBlur,
    onFieldFocus,
    values,
    touched,
    visited,
    validationResult,
    onChange,
    onSubmit,
    onFieldTouchedChange,
    onFieldVisitedChange,
    // For lower level controlling, like performing state changes from inside the form
    // or performing batched updates without firing events.
    setValues,
    setTouched,
    setVisited
  }
}

export default useController
