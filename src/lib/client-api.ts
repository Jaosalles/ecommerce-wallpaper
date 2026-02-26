type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

export async function apiFetch(input: string, init: RequestInit = {}) {
  const { credentials, ...rest } = init;

  return fetch(input, {
    ...rest,
    credentials: credentials ?? "include",
  });
}

type ParseApiResponseOptions = {
  fallbackErrorMessage?: string;
  allowEmptyData?: boolean;
};

export async function parseApiResponse<T>(
  response: Response,
  options: ParseApiResponseOptions = {},
) {
  const {
    fallbackErrorMessage = "Erro na requisição",
    allowEmptyData = false,
  } = options;

  let payload: ApiResponse<T> | null = null;

  try {
    payload = (await response.json()) as ApiResponse<T>;
  } catch {
    throw new Error(fallbackErrorMessage);
  }

  if (!response.ok || !payload.success) {
    throw new Error(payload.error ?? fallbackErrorMessage);
  }

  if (payload.data === undefined && !allowEmptyData) {
    throw new Error(fallbackErrorMessage);
  }

  return payload.data as T;
}
