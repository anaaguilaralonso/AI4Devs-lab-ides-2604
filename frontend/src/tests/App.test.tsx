import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import App from '../App';
import Dashboard from '../pages/Dashboard';
import AddCandidate from '../pages/AddCandidate';

function renderApp(initialRoute = '/') {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <App />
    </MemoryRouter>,
  );
}

test('dashboard shows add candidate link', () => {
  renderApp('/');
  expect(screen.getByRole('link', { name: /add candidate/i })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: /lti ats/i })).toBeInTheDocument();
});

test('add candidate page shows form', () => {
  renderApp('/candidates/new');
  expect(screen.getByRole('heading', { name: /add candidate/i })).toBeInTheDocument();
  expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /add candidate/i })).toBeInTheDocument();
});

test('navigates from dashboard to add candidate form', async () => {
  render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/candidates/new" element={<AddCandidate />} />
      </Routes>
    </MemoryRouter>,
  );

  await userEvent.click(screen.getByRole('link', { name: /add candidate/i }));

  expect(screen.getByRole('heading', { name: /add candidate/i })).toBeInTheDocument();
  expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
});
