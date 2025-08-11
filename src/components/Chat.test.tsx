import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Chat from './Chat';

vi.stubGlobal('crypto', { randomUUID: () => 'test-id' } as any);

it('accepts input and disables send when empty', async () => {
  render(<Chat />);
  const input = screen.getByTestId('chat-input');
  const send = screen.getByTestId('send-btn');
  expect(send).toBeDisabled();
  await userEvent.type(input, 'hello');
  expect(send).not.toBeDisabled();
});
