export type ServiceError<Code extends string = string> = {
  code: Code;
  message: string;
};

export type ServiceResult<T, Code extends string = string> =
  | { success: true; data: T }
  | { success: false; error: ServiceError<Code> };

export function serviceOk<T>(data: T): ServiceResult<T> {
  return { success: true, data };
}

export function serviceFail<T = never, Code extends string = string>(
  code: Code,
  message: string
): ServiceResult<T, Code> {
  return { success: false, error: { code, message } };
}
