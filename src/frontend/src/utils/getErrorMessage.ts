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
      const errorCode = error.match(/#(\d+)/)?.[1];
      return getReactErrorMessage(errorCode);
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
      return getReactErrorMessage(errorCode);
    }
    
    // Handle "Maximum update depth exceeded"
    if (message.includes('Maximum update depth exceeded')) {
      return 'The application encountered an infinite loop. Please reload the page to continue.';
    }
    
    // Handle "Invalid hook call"
    if (message.includes('Invalid hook call')) {
      return 'Invalid React hook usage detected. Hooks must be called at the top level of React components. Please reload the page.';
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
      const errorCode = message.match(/#(\d+)/)?.[1];
      return getReactErrorMessage(errorCode);
    }
    
    // Handle "Maximum update depth exceeded"
    if (message.includes('Maximum update depth exceeded')) {
      return 'The application encountered an infinite loop. Please reload the page to continue.';
    }
    
    // Handle "Invalid hook call"
    if (message.includes('Invalid hook call')) {
      return 'Invalid React hook usage detected. Hooks must be called at the top level of React components. Please reload the page.';
    }
    
    return message;
  }

  // Fallback for other types - avoid toString() which might fail
  return 'An unexpected error occurred. Please reload the page and try again.';
}

/**
 * Returns a user-friendly message for common React error codes
 */
function getReactErrorMessage(errorCode: string | undefined): string {
  switch (errorCode) {
    case '185':
      return 'Invalid React hook usage detected. Hooks must be called at the top level of React components. Please reload the page.';
    case '321':
      return 'Maximum update depth exceeded. The application encountered an infinite loop. Please reload the page.';
    case '418':
      return 'React context provider is missing. Please reload the page.';
    case '425':
      return 'React rendering error. Please reload the page.';
    default:
      return `A React error occurred${errorCode ? ` (code #${errorCode})` : ''}. Please reload the page and try again.`;
  }
}
