import { useCallback, useMemo, useState } from "react";
import type { EventPayload, FieldState } from "@paypal/react-paypal-js/sdk-v6";

export type CardFieldName = "number" | "cvv" | "expiry";
export type FieldsState = Record<CardFieldName, FieldState>;
type TouchedFields = Record<CardFieldName, boolean>;

const FIELD_LABELS: Record<CardFieldName, string> = {
  number: "Card number",
  cvv: "CVV",
  expiry: "Expiry",
};

const INITIAL_FIELD: FieldState = {
  isEmpty: true,
  isValid: false,
  isPotentiallyValid: true,
  isFocused: false,
};

const INITIAL_FIELDS_STATE: FieldsState = {
  number: INITIAL_FIELD,
  cvv: INITIAL_FIELD,
  expiry: INITIAL_FIELD,
};

const INITIAL_TOUCHED: TouchedFields = {
  number: false,
  cvv: false,
  expiry: false,
};

export type CardFieldsValidation = ReturnType<typeof useCardFieldsValidation>;

export const useCardFieldsValidation = () => {
  const [fieldsState, setFieldsState] =
    useState<FieldsState>(INITIAL_FIELDS_STATE);
  const [touchedFields, setTouchedFields] =
    useState<TouchedFields>(INITIAL_TOUCHED);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const syncFieldsState = useCallback((event: EventPayload) => {
    const { number, cvv, expiry } = event.data;
    setFieldsState({ number, cvv, expiry });
  }, []);

  const handleBlur = useCallback(
    (event: EventPayload) => {
      const field = event.data.emittedBy as CardFieldName;
      setTouchedFields((prev) =>
        prev[field] ? prev : { ...prev, [field]: true },
      );
      syncFieldsState(event);
    },
    [syncFieldsState],
  );

  const handlers = useMemo(
    () => ({
      validitychange: syncFieldsState,
      empty: syncFieldsState,
      notempty: syncFieldsState,
      blur: handleBlur,
    }),
    [syncFieldsState, handleBlur],
  );

  const markAllTouched = useCallback(() => {
    setHasSubmitted(true);
  }, []);

  const getFieldError = useCallback(
    (fieldName: CardFieldName): string | null => {
      if (!touchedFields[fieldName] && !hasSubmitted) return null;
      const field = fieldsState[fieldName];
      if (field.isEmpty) return `${FIELD_LABELS[fieldName]} is required`;
      if (!field.isValid) return `${FIELD_LABELS[fieldName]} is invalid`;
      return null;
    },
    [fieldsState, touchedFields, hasSubmitted],
  );

  const isFormValid =
    fieldsState.number.isValid &&
    fieldsState.cvv.isValid &&
    fieldsState.expiry.isValid;

  return {
    fieldsState,
    getFieldError,
    isFormValid,
    markAllTouched,
    handlers,
  };
};
