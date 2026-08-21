export type CmsErrorCode =
  | "CONFIGURATION"
  | "HTTP"
  | "INVALID_RESPONSE"
  | "NETWORK"
  | "TIMEOUT";

type CmsErrorOptions = Readonly<{
  cause?: unknown;
  status?: number;
}>;

export class CmsError extends Error {
  readonly code: CmsErrorCode;
  readonly status?: number;

  constructor(code: CmsErrorCode, message: string, options: CmsErrorOptions = {}) {
    super(message, { cause: options.cause });
    this.name = "CmsError";
    this.code = code;
    this.status = options.status;
  }
}
