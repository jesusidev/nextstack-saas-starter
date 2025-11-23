import { useNotificationDispatcher } from '~/events';
import { getPermissionErrorInfo, getSuccessToastInfo } from '~/utils/errorHandling';
import { api } from '~/utils/trpc';

/**
 * Modern Project Service Hook following TRPC v11 and TanStack Query v5 best practices
 */
export function useProjectService() {
  const utils = api.useUtils();
  const notificationDispatcher = useNotificationDispatcher();

  // QUERIES
  function useProjects() {
    const result = api.project.projects.useQuery(undefined, {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: (failureCount, error) => {
        return failureCount < 2 && !error.message.includes('UNAUTHORIZED');
      },
    });

    // Ensure list query returns array
    return {
      ...result,
      data: Array.isArray(result.data) ? result.data : result.data ? [result.data] : [],
    };
  }

  function useProject(id: string) {
    const result = api.project.projects.useQuery(
      { id },
      {
        enabled: !!id,
        staleTime: 1000 * 60 * 5,
      }
    );

    // Transform the result to ensure proper typing for single project
    return {
      ...result,
      data: result.data && !Array.isArray(result.data) ? result.data : undefined,
    };
  }

  function useProjectProducts(projectId: string) {
    const result = api.product.products.useQuery(
      { projectId },
      {
        enabled: !!projectId,
        staleTime: 1000 * 60 * 5,
      }
    );

    // Ensure we always return an array for list queries
    return {
      ...result,
      data: Array.isArray(result.data) ? result.data : result.data ? [result.data] : [],
    };
  }

  // MUTATIONS
  function useUpdateProject() {
    return api.project.update.useMutation({
      onSuccess: (_updatedProject) => {
        utils.project.projects.invalidate();
        // Show success notification using dispatcher
        const successInfo = getSuccessToastInfo('updated', 'Project');
        notificationDispatcher.show(successInfo);
      },
      onError: (error) => {
        // Handle permission errors using dispatcher
        const errorInfo = getPermissionErrorInfo(error, 'project');
        if (errorInfo) {
          notificationDispatcher.show(errorInfo);
        }
      },
    });
  }

  function useCreateProject() {
    return api.project.create.useMutation({
      onMutate: async (newProject) => {
        await utils.project.projects.cancel();

        const previousProjects = utils.project.projects.getData();

        const optimisticProject = {
          id: `temp-${Date.now()}`,
          name: newProject.name ?? 'New Project',
          updatedAt: new Date(),
          status: 'ACTIVE' as const,
          totalProjectProducts: 0,
        };

        utils.project.projects.setData(undefined, (old) =>
          Array.isArray(old) ? [optimisticProject, ...old] : [optimisticProject]
        );

        return { previousProjects };
      },
      onSuccess: (createdProject) => {
        utils.project.projects.invalidate();

        notificationDispatcher.show({
          message: `${createdProject.name} has been created successfully`,
          type: 'success',
        });
      },
      onError: (error, _variables, context) => {
        if (context?.previousProjects) {
          utils.project.projects.setData(undefined, context.previousProjects);
        }

        // Smart error detection for duplicate project names
        const errorMessage = error.message || String(error);
        const isDuplicateError =
          errorMessage.toLowerCase().includes('duplicate') ||
          errorMessage.toLowerCase().includes('already exists') ||
          errorMessage.toLowerCase().includes('unique constraint');

        notificationDispatcher.show({
          message: isDuplicateError
            ? 'A project with this name already exists'
            : `Failed to create project: ${errorMessage}`,
          type: 'error',
        });
      },
    });
  }

  // Convenience function to get all mutations at once
  function useMutations() {
    return {
      createProject: useCreateProject(),
      updateProject: useUpdateProject(),
    };
  }

  return {
    // Modern Query Hooks
    useProjects,
    useProject,
    useProjectProducts,

    // All mutations in one convenient hook
    useMutations,

    // Utils for manual cache management if needed
    utils: utils.project,
  };
}
