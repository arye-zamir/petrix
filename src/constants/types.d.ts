import { ERROR_CODE } from "./errors";

export type ErrorCode = (typeof ERROR_CODE)[keyof typeof ERROR_CODE];
