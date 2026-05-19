import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import CandidateForm, { buildFormData } from '../components/CandidateForm';
import StatusMessage from '../components/StatusMessage';
import { postCandidate } from '../services/candidateApi';
import {
  CandidateApiError,
  CandidateFormValues,
  CreateCandidateResponse,
} from '../types/candidate';
import '../styles/candidate-form.css';

export default function AddCandidate() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState<CreateCandidateResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (values: CandidateFormValues) => {
    setIsSubmitting(true);
    setSuccess(null);
    setErrorMessage(null);

    try {
      const result = await postCandidate(buildFormData(values));
      setSuccess(result);
    } catch (error) {
      if (error instanceof CandidateApiError) {
        if (error.errors) {
          throw error;
        }
        setErrorMessage(error.message);
        return;
      }
      setErrorMessage('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="page page--form">
      <header className="page__header">
        <Link to="/" className="page__back">
          Back to dashboard
        </Link>
        <h1>Add candidate</h1>
        <p>Enter the candidate details below. Fields marked with * are required.</p>
      </header>

      {success && (
        <StatusMessage variant="success" title={success.message}>
          <p>
            <strong>
              {success.firstName} {success.lastName}
            </strong>{' '}
            ({success.email}) has been registered.
          </p>
          <p>
            <Link to="/candidates/new" onClick={() => setSuccess(null)}>
              Add another candidate
            </Link>{' '}
            or{' '}
            <Link to="/">return to dashboard</Link>.
          </p>
        </StatusMessage>
      )}

      {errorMessage && !success && (
        <StatusMessage variant="error" title={errorMessage} />
      )}

      {!success && (
        <CandidateForm onSubmit={handleSubmit} disabled={isSubmitting} />
      )}
    </main>
  );
}
