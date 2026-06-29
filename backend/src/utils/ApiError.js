export class ApiError extends Error {
  constructor(statusCode, message, code = 'ERROR', fields = null) {
    super(message);

    this.statusCode = statusCode;
    this.code = code;
    this.fields = fields;
    this.isOperational = true;
  }
}
