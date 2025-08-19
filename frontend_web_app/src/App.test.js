import { render, screen } from '@testing-library/react';
import App from './App';

test('renders action buttons', () => {
  render(<App />);
  expect(screen.getByText(/Find Email/i)).toBeInTheDocument();
  expect(screen.getByText(/Find Phone Number/i)).toBeInTheDocument();
});
