import type { ErrorCode } from "../../constants/types";
import type { RequestConfig, PetrixResponse } from "../client/types";
import type { PetrixErrorOptions } from "./types";
import type { PetrixError } from "../client/types";

export class PetrixRequestError extends Error implements PetrixError {
  readonly code: ErrorCode;
  readonly config: RequestConfig;
  readonly status?: number;
  readonly statusText?: string;
  readonly headers?: Record<string, string>;
  readonly response?: PetrixResponse;
  readonly cause?: Error;

  constructor(options: PetrixErrorOptions) {
    super(options.message);
    this.name = "PetrixRequestError";
    this.code = options.code;
    this.config = options.config;
    this.status = options.status;
    this.statusText = options.statusText;
    this.headers = options.headers;
    this.response = options.response;
    this.cause = options.cause;
  }
}
