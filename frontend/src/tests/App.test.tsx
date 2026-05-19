import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '../App';

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
