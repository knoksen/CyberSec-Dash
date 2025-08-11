describe('AiChat', () => {
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AiChat from './Chat';
import { describe, it, expect, vi } from 'vitest';

vi.stubGlobal('self', { crypto: { randomUUID: () => 'test-id' } });

describe('AiChat', () => {
  it('renders and accepts input', async () => {
    render(<AiChat />);
    const input = screen.getByPlaceholderText(/ask an agent/i);
    await userEvent.type(input, 'hello');
    expect(input).toHaveValue('hello');
  });
});
