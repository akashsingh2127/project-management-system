export const CacheKeys = {
  // Task keys
  task: (userId: string, taskId: string) => `tasks:${userId}:${taskId}`,
  userTasks: (userId: string, queryParamsStr: string) => `tasks:${userId}:list:${queryParamsStr}`,
  userTasksPattern: (userId: string) => `tasks:${userId}:*`,

  // Project keys
  project: (userId: string, projectId: string) => `projects:${userId}:${projectId}`,
  userProjects: (userId: string, queryParamsStr: string) => `projects:${userId}:list:${queryParamsStr}`,
  userProjectsPattern: (userId: string) => `projects:${userId}:*`,

  // Dashboard keys
  dashboard: (userId: string) => `dashboard:${userId}`,
};
