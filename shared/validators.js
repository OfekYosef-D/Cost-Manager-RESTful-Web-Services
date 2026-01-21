// Common validation utilities for request data
function validateNumericValue(value, fieldName) {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) {
    return {
      isValid: false,
      error: {
        id: 'INVALID_NUMERIC_VALUE',
        message: `${fieldName} must be a valid number`
      }
    };
  }
  return { isValid: true, value: numericValue };
}

function validateStringValue(value, fieldName, allowEmpty = false) {
  // Check if value is a string type
  if (typeof value !== 'string') {
    return {
      isValid: false,
      error: {
        id: 'INVALID_STRING_VALUE',
        message: `${fieldName} must be a string`
      }
    };
  }
  
  // Check if string is empty (if empty strings are not allowed)
  if (!allowEmpty && value.trim().length === 0) {
    return {
      isValid: false,
      error: {
        id: 'EMPTY_STRING_VALUE',
        message: `${fieldName} cannot be empty`
      }
    };
  }
  
  return { isValid: true, value: value.trim() };
}

function validateRequiredFields(data, requiredFields) {
  const missingFields = [];
  
  // Check each required field for presence
  for (const field of requiredFields) {
    if (data[field] === undefined || data[field] === null) {
      missingFields.push(field);
    }
  }
  
  // Return error if any fields are missing
  if (missingFields.length > 0) {
    return {
      isValid: false,
      error: {
        id: 'MISSING_REQUIRED_FIELDS',
        message: `Missing required fields: ${missingFields.join(', ')}`
      }
    };
  }
  
  return { isValid: true };
}

function validateEnumValue(value, allowedValues, fieldName) {
  if (!allowedValues.includes(value)) {
    return {
      isValid: false,
      error: {
        id: 'INVALID_ENUM_VALUE',
        message: `${fieldName} must be one of: ${allowedValues.join(', ')}`
      }
    };
  }
  return { isValid: true };
}

function validatePositiveNumber(value, fieldName) {
  // First validate that value is numeric
  const numericResult = validateNumericValue(value, fieldName);
  if (!numericResult.isValid) {
    return numericResult;
  }
  
  // Check that the number is positive (zero or greater)
  if (numericResult.value < 0) {
    return {
      isValid: false,
      error: {
        id: 'NEGATIVE_NUMBER_VALUE',
        message: `${fieldName} must be a positive number`
      }
    };
  }
  
  return { isValid: true, value: numericResult.value };
}

module.exports = {
  validateNumericValue,
  validateStringValue,
  validateRequiredFields,
  validateEnumValue,
  validatePositiveNumber
};
