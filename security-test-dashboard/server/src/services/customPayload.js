export const MAX_CUSTOM_PAYLOAD_LENGTH = 1000;

const familyHints = {
  booleanBased: {
    label: "boolean-based",
    pattern: /\b(or|and)\b\s+[\w'"]+\s*=\s*[\w'"]/i,
  },
  unionBased: {
    label: "union-based",
    pattern: /\bunion\b[\s\S]*\bselect\b/i,
  },
  errorBased: {
    label: "error-based",
    pattern: /\b(extractvalue|updatexml|floor|rand)\s*\(/i,
  },
  timeBased: {
    label: "time-based",
    pattern: /\b(sleep|benchmark)\s*\(/i,
  },
  orderBy: {
    label: "ORDER BY",
    pattern: /\b(select|sleep|benchmark)\s*\(|,/i,
  },
  secondOrder: {
    label: "second-order",
    pattern: /\b(union|select|sleep|or|and)\b/i,
  },
};

export class CustomPayloadValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = "CustomPayloadValidationError";
    this.statusCode = 400;
  }
}

function validateCustomPayload(customPayload) {
  if (customPayload === undefined || customPayload === null) {
    return null;
  }

  if (typeof customPayload !== "string") {
    throw new CustomPayloadValidationError("Custom payload must be a string.");
  }

  if (customPayload.trim().length === 0) {
    throw new CustomPayloadValidationError("Custom payload cannot be empty.");
  }

  if (customPayload.length > MAX_CUSTOM_PAYLOAD_LENGTH) {
    throw new CustomPayloadValidationError(`Custom payload is too long. Max length is ${MAX_CUSTOM_PAYLOAD_LENGTH} characters.`);
  }

  return customPayload;
}

function getPayloadWarning(testCase, payload) {
  const hint = familyHints[testCase.payloadGroup];
  if (!hint || hint.pattern.test(payload)) {
    return null;
  }

  return `Custom payload does not look like a ${hint.label} payload, so classification may need manual review.`;
}

export function resolvePayloadSelection({ testCase, payloadMap, customPayload }) {
  const validatedCustomPayload = validateCustomPayload(customPayload);

  if (validatedCustomPayload !== null) {
    return {
      payload: validatedCustomPayload,
      payloadSource: "CUSTOM",
      payloadWarning: getPayloadWarning(testCase, validatedCustomPayload),
    };
  }

  const defaultPayload = payloadMap[testCase.payloadGroup]?.[0];
  if (!defaultPayload) {
    throw new Error(`No payload configured for ${testCase.payloadGroup}`);
  }

  return {
    payload: defaultPayload,
    payloadSource: "DEFAULT",
    payloadWarning: null,
  };
}
