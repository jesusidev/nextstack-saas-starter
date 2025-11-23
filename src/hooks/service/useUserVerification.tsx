import { useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import { api } from '~/utils/trpc';

/**
 * Hook for verifying if a user exists in the database and managing user data
 *
 * @returns Object containing:
 * - showNameConfirmation: boolean indicating if the name confirmation modal should be shown
 * - isUserLoading: boolean indicating if user data is being loaded
 * - createUser: function to create a new user
 * - updateUser: function to update an existing user
 * - userInfo: user data from the database
 */
export function useUserVerification() {
  const { user, isLoaded: isUserLoaded } = useUser();
  const [showNameConfirmation, setShowNameConfirmation] = useState(false);

  const { mutate: createUser } = api.user.create.useMutation();
  const { mutate: updateUser } = api.user.update.useMutation();

  const {
    data: userInfo,
    isLoading: userInfoLoading,
    isFetched: isUserInfoFetched,
  } = api.user.get.useQuery(undefined, {
    enabled: user !== undefined && isUserLoaded,
  });

  useEffect(() => {
    // Don't do anything until both user data is loaded and user info query has completed
    if (userInfoLoading || !isUserLoaded || !isUserInfoFetched) {
      return;
    }

    const { firstName, lastName, id: userInfoId } = userInfo ?? {};
    const { firstName: userFirstName, lastName: userLastName, primaryEmailAddress } = user ?? {};
    const userEmail = primaryEmailAddress?.emailAddress;
    const userId = user?.id ?? '';

    // Show name confirmation if the user doesn't exist in our database
    if (!userInfo) {
      setShowNameConfirmation(true);
      return;
    } else {
      setShowNameConfirmation(false);
    }

    // If the user exists in Clerk but not in our database with the same ID
    if (!userInfoId?.includes(userId)) {
      if (userFirstName && userLastName && userEmail) {
        createUser({
          firstName: userFirstName,
          lastName: userLastName,
          email: userEmail,
        });
      }
      return;
    }

    // If the user exists but the name has changed in Clerk
    if (
      (userFirstName && firstName !== userFirstName) ||
      (userLastName && lastName !== userLastName)
    ) {
      if (userEmail && userFirstName && userLastName) {
        updateUser({
          firstName: userFirstName,
          lastName: userLastName,
          email: userEmail,
        });
      }
    }
  }, [userInfo, user, userInfoLoading, isUserLoaded, isUserInfoFetched, createUser, updateUser]);

  return {
    showNameConfirmation,
    isUserLoading: userInfoLoading || !isUserLoaded,
    createUser,
    updateUser,
    userInfo,
  };
}
