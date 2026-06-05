export function describeApiError(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }
  return "Something went wrong";
}
