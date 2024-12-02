import type { ErrorCode } from "../../constants/types";
import type { RequestConfig, PetrixResponse } from "../client/types";

export interface PetrixErrorOptions {
  code: ErrorCode;
  message: string;
  config: RequestConfig;
  status?: number;
  statusText?: string;
  headers?: Record<string, string>;
  response?: PetrixResponse;
  cause?: Error;
}
