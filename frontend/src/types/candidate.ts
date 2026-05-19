export interface CreateCandidateResponse {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  message: string;
}

export interface ApiErrorBody {
  message: string;
  errors?: Record<string, string>;
}

export class CandidateApiError extends Error {
  status: number;
  errors?: Record<string, string>;

  constructor(status: number, body: ApiErrorBody) {
    super(body.message);
    this.name = 'CandidateApiError';
    this.status = status;
    this.errors = body.errors;
  }
}

export interface CandidateFormValues {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  education: string;
  experience: string;
  cv: File | null;
}
