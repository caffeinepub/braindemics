/**
 * Safely extracts a user-friendly error message from an unknown error value.
 * Avoids JSON.stringify on unknown objects to prevent BigInt serialization errors.
 * Handles React minified errors and common runtime failures.
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
    // Handle React minified errors
    if (error.includes('Minified React error')) {
      return 'A React error occurred. Please refresh the page and try again.';
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
    
    // Handle React minified errors (e.g., #185, #321)
    if (message.includes('Minified React error')) {
      const errorCode = message.match(/#(\d+)/)?.[1];
      if (errorCode === '185') {
        return 'Invalid hook call detected. The application encountered a configuration error. Please refresh the page.';
      }
      if (errorCode === '321') {
        return 'Maximum update depth exceeded. The application encountered a loop. Please refresh the page.';
      }
      return `A React error occurred (code ${errorCode || 'unknown'}). Please refresh the page and try again.`;
    }
    
    // Handle "Maximum update depth exceeded"
    if (message.includes('Maximum update depth exceeded')) {
      return 'The application encountered an infinite loop. Please refresh the page.';
    }
    
    // Handle "Invalid hook call"
    if (message.includes('Invalid hook call')) {
      return 'Invalid hook call detected. The application encountered a configuration error. Please refresh the page.';
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
    
    // Handle React minified errors
    if (message.includes('Minified React error')) {
      return 'A React error occurred. Please refresh the page and try again.';
    }
    
    // Handle "Maximum update depth exceeded"
    if (message.includes('Maximum update depth exceeded')) {
      return 'The application encountered an infinite loop. Please refresh the page.';
    }
    
    // Handle "Invalid hook call"
    if (message.includes('Invalid hook call')) {
      return 'Invalid hook call detected. The application encountered a configuration error. Please refresh the page.';
    }
    
    return message;
  }

  // Fallback for other types - avoid toString() which might fail
  return 'An unexpected error occurred. Please refresh the page and try again.';
}
