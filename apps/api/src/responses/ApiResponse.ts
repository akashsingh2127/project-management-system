export class ApiResponse {
  static success<T>(data: T, message?: string, meta?: any) {
    return {
      success: true,
      message,
      data,
      meta,
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
