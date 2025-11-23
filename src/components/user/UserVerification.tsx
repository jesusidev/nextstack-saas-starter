'use client';

import ModalNameConfirmation from '~/components/modal/nameConfirmation';
import { useUserVerification } from '~/hooks/service/useUserVerification';

/**
 * Component that handles user verification and displays the name confirmation modal if needed
 *
 * This component doesn't render anything visible by itself, it just conditionally renders
 * the ModalNameConfirmation when needed.
 */
export function UserVerification() {
  const { showNameConfirmation } = useUserVerification();

  if (!showNameConfirmation) {
    return null;
  }

  return <ModalNameConfirmation />;
}
