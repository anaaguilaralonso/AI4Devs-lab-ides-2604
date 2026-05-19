import {
  CandidateApiError,
  CreateCandidateResponse,
} from '../types/candidate';

const API_URL = process.env.REACT_APP_API_URL ?? 'http://localhost:3010';

export async function postCandidate(
  formData: FormData,
): Promise<CreateCandidateResponse> {
  let response: Response;

  try {
    response = await fetch(`${API_URL}/api/candidates`, {
      method: 'POST',
      body: formData,
    });
  } catch {
    throw new CandidateApiError(0, {
      message:
        'Could not connect to the server. Please check your connection and try again.',
    });
  }

  const body = await response.json().catch(() => ({
    message: 'Unexpected server response.',
  }));

  if (!response.ok) {
    throw new CandidateApiError(response.status, body);
  }

  return body as CreateCandidateResponse;
}
