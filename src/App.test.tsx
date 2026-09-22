import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Aegis Link landing headline', () => {
  render(<App />);
  const headingElements = screen.getAllByText(/Aegis Link/i);
  expect(headingElements.length).toBeGreaterThan(0);
});

test('renders Get Started button on landing view', () => {
  render(<App />);
  const getStartedBtn = screen.getByRole('button', { name: /get started/i });
  expect(getStartedBtn).toBeInTheDocument();
});
