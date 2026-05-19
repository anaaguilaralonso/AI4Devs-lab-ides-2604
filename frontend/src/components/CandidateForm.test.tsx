import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CandidateForm, { validateCandidateForm } from './CandidateForm';
import { CandidateApiError } from '../types/candidate';

describe('validateCandidateForm', () => {
  it('returns errors when required fields are empty', () => {
    const errors = validateCandidateForm({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      education: '',
      experience: '',
      cv: null,
    });

    expect(errors.firstName).toBe('First name is required');
    expect(errors.lastName).toBe('Last name is required');
    expect(errors.email).toBe('Email is required');
  });

  it('returns error for invalid email', () => {
    const errors = validateCandidateForm({
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'not-an-email',
      phone: '',
      address: '',
      education: '',
      experience: '',
      cv: null,
    });

    expect(errors.email).toBe('Invalid email address');
  });

  it('returns error for disallowed CV extension', () => {
    const file = new File(['data'], 'resume.exe', {
      type: 'application/octet-stream',
    });

    const errors = validateCandidateForm({
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane@example.com',
      phone: '',
      address: '',
      education: '',
      experience: '',
      cv: file,
    });

    expect(errors.cv).toBe('Only PDF or DOCX files are allowed');
  });
});

describe('CandidateForm', () => {
  it('does not call onSubmit when validation fails', async () => {
    const onSubmit = jest.fn();
    render(<CandidateForm onSubmit={onSubmit} />);

    await userEvent.click(screen.getByRole('button', { name: /add candidate/i }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByText('First name is required')).toBeInTheDocument();
  });

  it('calls onSubmit with valid values', async () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined);
    render(<CandidateForm onSubmit={onSubmit} />);

    await userEvent.type(screen.getByLabelText(/first name/i), 'Jane');
    await userEvent.type(screen.getByLabelText(/last name/i), 'Doe');
    await userEvent.type(screen.getByLabelText(/^email/i), 'jane@example.com');
    await userEvent.click(screen.getByRole('button', { name: /add candidate/i }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          firstName: 'Jane',
          lastName: 'Doe',
          email: 'jane@example.com',
        }),
      );
    });
  });

  it('shows server field errors from CandidateApiError', async () => {
    const onSubmit = jest.fn().mockRejectedValue(
      new CandidateApiError(400, {
        message: 'Invalid data',
        errors: { email: 'Invalid email address' },
      }),
    );

    render(<CandidateForm onSubmit={onSubmit} />);

    await userEvent.type(screen.getByLabelText(/first name/i), 'Jane');
    await userEvent.type(screen.getByLabelText(/last name/i), 'Doe');
    await userEvent.type(screen.getByLabelText(/^email/i), 'bad');
    await userEvent.click(screen.getByRole('button', { name: /add candidate/i }));

    expect(await screen.findByText('Invalid email address')).toBeInTheDocument();
  });
});
