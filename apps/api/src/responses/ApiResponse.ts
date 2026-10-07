export class ApiResponse {
  static success<T>(data: T, message?: string) {
    return {
      success: true,
      message,
      data,
    };
  }

  static error(message: string, errors?: any) {
    return {
      success: false,
      message,
      errors,
    };
  }
}
