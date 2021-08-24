/*
 * This file has nothing to do with the misinformation game,
 * but I've left it in here as an example. -Paddy L.
 */

import { render, screen } from '@testing-library/react';
import App from './App';

test('renders learn react link', () => {
  render(<App />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
