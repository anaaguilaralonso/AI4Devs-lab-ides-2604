import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import AddCandidate from './AddCandidate';
import { postCandidate } from '../services/candidateApi';
import { CandidateApiError } from '../types/candidate';

jest.mock('../services/candidateApi');
const mockPostCandidate = postCandidate as jest.MockedFunction<typeof postCandidate>;

function renderAddCandidate() {
  return render(
    <MemoryRouter>
      <AddCandidate />
    </MemoryRouter>,
  );
}

describe('AddCandidate', () => {
  beforeEach(() => {
    mockPostCandidate.mockReset();
  });

  it('shows success message after successful submit', async () => {
    mockPostCandidate.mockResolvedValue({
      id: 1,
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane@example.com',
      message: 'Candidate added successfully',
    });

    renderAddCandidate();

    await userEvent.type(screen.getByLabelText(/first name/i), 'Jane');
    await userEvent.type(screen.getByLabelText(/last name/i), 'Doe');
    await userEvent.type(screen.getByLabelText(/^email/i), 'jane@example.com');
    await userEvent.click(screen.getByRole('button', { name: /add candidate/i }));

    expect(
      await screen.findByText('Candidate added successfully'),
    ).toBeInTheDocument();
    expect(screen.getByText(/jane@example.com/)).toBeInTheDocument();
    expect(screen.queryByLabelText(/first name/i)).not.toBeInTheDocument();
  });

  it('shows error message on duplicate email', async () => {
    mockPostCandidate.mockRejectedValue(
      new CandidateApiError(409, {
        message: 'A candidate with this email already exists',
      }),
    );

    renderAddCandidate();

    await userEvent.type(screen.getByLabelText(/first name/i), 'Jane');
    await userEvent.type(screen.getByLabelText(/last name/i), 'Doe');
    await userEvent.type(screen.getByLabelText(/^email/i), 'jane@example.com');
    await userEvent.click(screen.getByRole('button', { name: /add candidate/i }));

    expect(
      await screen.findByText('A candidate with this email already exists'),
    ).toBeInTheDocument();
  });

  it('shows connection error when API is unreachable', async () => {
    mockPostCandidate.mockRejectedValue(
      new CandidateApiError(0, {
        message:
          'Could not connect to the server. Please check your connection and try again.',
      }),
    );

    renderAddCandidate();

    await userEvent.type(screen.getByLabelText(/first name/i), 'Jane');
    await userEvent.type(screen.getByLabelText(/last name/i), 'Doe');
    await userEvent.type(screen.getByLabelText(/^email/i), 'jane@example.com');
    await userEvent.click(screen.getByRole('button', { name: /add candidate/i }));

    expect(
      await screen.findByText(/could not connect to the server/i),
    ).toBeInTheDocument();
  });
});
