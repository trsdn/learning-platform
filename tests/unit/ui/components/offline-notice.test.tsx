/**
 * Unit tests for the offline notice shown while the app runs on cached
 * content (#227).
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import '../../../setup/a11y-matchers';
import { OfflineNotice } from '@/modules/ui/components/offline-notice';

describe('OfflineNotice', () => {
  it('explains in German that content is cached and progress is not saved', () => {
    render(<OfflineNotice />);

    const notice = screen.getByRole('status');
    expect(notice).toHaveTextContent('Offline-Modus');
    expect(notice).toHaveTextContent('gespeicherte Inhalte');
    expect(notice).toHaveTextContent('Fortschritt');
  });

  it('announces itself without forcing focus away from the page', () => {
    render(<OfflineNotice />);

    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('has no WCAG violations', async () => {
    const { container } = render(<OfflineNotice />);

    expect(await axe(container)).toHaveNoViolations();
  });
});
