/**
 * Safely extracts a user-friendly error message from an unknown error value.
 * Avoids JSON.stringify on unknown objects to prevent BigInt serialization errors.
 */
export function getErrorMessage(error: unknown): string {
  // Handle null/undefined
  if (error == null) {
    return 'An unknown error occurred';
  }

  // Handle string errors
  if (typeof error === 'string') {
    // Replace BigInt serialization error with friendly message
    if (error.includes('Do not know how to serialize a BigInt')) {
      return 'Failed to process the request. Please try again.';
    }
    return error;
  }

  // Handle Error objects
  if (error instanceof Error) {
    const message = error.message || 'An error occurred';
    // Replace BigInt serialization error with friendly message
    if (message.includes('Do not know how to serialize a BigInt')) {
      return 'Failed to process the request. Please try again.';
    }
    return message;
  }

  // Handle objects with a message property
  if (typeof error === 'object' && 'message' in error) {
    const message = String((error as any).message);
    // Replace BigInt serialization error with friendly message
    if (message.includes('Do not know how to serialize a BigInt')) {
      return 'Failed to process the request. Please try again.';
    }
    return message;
  }

  // Fallback for other types
  return 'An unexpected error occurred';
}
