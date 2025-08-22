import axiosInstance from "./axiosInstance";

// Interface for user groups response
interface UserGroupsResponse {
  success: boolean;
  active_user_groups?: any[];
  inactive_user_groups?: any[];
  is_admin: boolean;
}

// Interface for user group info response
interface UserGroupInfoResponse {
  success: boolean;
  user_group_dict?: {
    group_name: string;
    group_id: number | string;
    user_count: number;
  };
  message?: string;
}

// Interface for update group name response
interface UpdateGroupNameResponse {
  success: boolean;
  message?: string;
}

// Interface for update date response
interface UpdateDateResponse {
  success: boolean;
  message?: string;
}

// Interface for toggle group activation response
interface ToggleGroupActivationResponse {
  success: boolean;
  message?: string;
}

// Interface for user search response
export interface UserSearchResponse {
  success: boolean;
  user_dicts?: UserInfo[];
  message?: string;
}

// Interface for user group management response
interface UserGroupManagementResponse {
  success: boolean;
  message?: string;
}

// Interface for user activation/deactivation response
interface UserActivationResponse {
  success: boolean;
  message?: string;
}

// Interface for folder information
export interface FolderInfo {
  folder_name: string;
  folder_id: number | string;
  elements_count?: number;
  group_elements_count?: number;
}

// Interface for folder response
interface GroupFoldersResponse {
  success: boolean;
  folders?: FolderInfo[];
  is_admin: boolean;
  message?: string;
}

// Interface for user information
export interface UserInfo {
  user_id: number | string;
  name: string;
  surname: string;
  email: string;
  phone: string;
  telegram_username: string;
  is_active: boolean;
}

// Interface for folder test item information
export interface FolderTestInfo {
  test_name: string;
  test_id: number | string;
  tfp_sha: string;
  added_to_group: boolean;
}

// Interface for folder lesson item information
export interface FolderLessonInfo {
  lesson_name: string;
  lesson_id: number | string;
  lfp_sha: string;
  added_to_group: boolean;
}

// Interface for folder tests response
interface FolderTestsResponse {
  success: boolean;
  tests?: FolderTestInfo[];
  is_admin: boolean;
  message?: string;
}

// Interface for folder lessons response
interface FolderLessonsResponse {
  success: boolean;
  lessons?: FolderLessonInfo[];
  is_admin: boolean;
  message?: string;
}

// Interface for adding/removing tests and lessons from groups
interface GroupContentManagementResponse {
  success: boolean;
  message?: string;
}

// Interface for test information within folder statistics
export interface FolderTestStatistics {
  test_id: number | string;
  test_name: string;
  tfp_sha: string;
  correct_percentage: number;
  stars: number;
}

// Interface for folder statistics
export interface FolderStatistics {
  folder_id: number | string;
  folder_name: string;
  tests: FolderTestStatistics[];
  avg_correct_percentage: number;
}

// Interface for main user statistics response
interface MainUserStatisticsResponse {
  success: boolean;
  folder_dicts?: FolderStatistics[];
  stars_number?: number;
  total_available_tests?: number;
  total_solved_tests?: number;
  avg_solved_correct_percentage?: number;
  is_admin: boolean;
  error?: string;
}

// Interface for paginated group users response
export interface GroupUsersPaginatedResponse {
  success: boolean;
  users?: UserInfo[];
  pagination?: {
    current_page: number;
    total_pages: number;
    total_count: number;
    page_size: number;
    has_next: boolean;
    has_prev: boolean;
  };
  is_admin: boolean;
  message?: string;
}

// Interface for paginated all users response
export interface AllUsersPaginatedResponse {
  success: boolean;
  users?: UserInfo[];
  pagination?: {
    current_page: number;
    total_pages: number;
    total_count: number;
    page_size: number;
    has_next: boolean;
    has_prev: boolean;
  };
  is_admin: boolean;
  message?: string;
}

// Interface for user request information
export interface UserRequest {
  request_id: number;
  status?: string;
  comment?: string;
  phone?: string;
  email?: string;
  name?: string;
  surname?: string;
  telegram_username?: string;
  instagram_username?: string;
  created_at?: string;
  updated_at?: string;
}

// Interface for paginated user requests response
export interface UserRequestsPaginatedResponse {
  success: boolean;
  requests?: UserRequest[];
  pagination?: {
    current_page: number;
    total_pages: number;
    total_count: number;
    page_size: number;
    has_next: boolean;
    has_prev: boolean;
  };
  is_admin: boolean;
  message?: string;
}

// Interface for create user request payload
export interface CreateUserRequestPayload {
  comment?: string;
  phone?: string;
  telegram_username?: string;
  instagram_username?: string;
  name?: string;
  surname?: string;
  email?: string;
}

// Interface for create user request response
export interface CreateUserRequestResponse {
  success: boolean;
  message?: string;
  request_id?: number;
}

// Interface for delete user request response
export interface DeleteUserRequestResponse {
  success: boolean;
  message?: string;
}

// Interface for update user name response
interface UpdateUserNameResponse {
  success: boolean;
  message?: string;
}

// Interface for update user surname response
interface UpdateUserSurnameResponse {
  success: boolean;
  message?: string;
}

// Interface for active groups response
interface ActiveGroupsResponse {
  success: boolean;
  groups?: {
    group_name: string;
    group_id: number;
  }[];
  message?: string;
}

// Interface for bulk user creation payload
export interface BulkCreateUsersPayload {
  users: {
    name: string;
    surname: string;
    email: string;
    phone?: string;
    telegram_username?: string;
    instagram_username?: string;
  }[];
  group_ids: (string | number)[];
}

// Interface for bulk user creation response
export interface BulkCreateUsersResponse {
  success: boolean;
  message?: string;
  created_users_count?: number;
  failed_users?: {
    email: string;
    error: string;
  }[];
}

// Interface for user creation log
export interface UserCreationLog {
  add_process_id: number;
  updated_at: string;
  total_added_users: number;
  successful_creations: number;
  failed_creations: number;
  successful_emails: number;
  failed_emails: number;
  status: 'started' | 'finished';
}

// Interface for email stats response
export interface EmailStatsResponse {
  success: boolean;
  email_stats?: {
    emails_sent_today: number;
    emails_left_for_today: number;
    user_creation_logs: UserCreationLog[];
  };
  message?: string;
}

// Interface for create new group payload
export interface CreateNewGroupPayload {
  groupName: string;
  openDate?: string;
  closeDate?: string;
}

// Interface for create new group response
export interface CreateNewGroupResponse {
  success: boolean;
  message?: string;
}

// Interface for get user password response
export interface GetUserPasswordResponse {
  success: boolean;
  password?: string;
  message?: string;
}

/**
 * Fetches all active user groups
 * @returns Promise with active user groups and admin status
 */
export const getUserGroups = async (): Promise<UserGroupsResponse> => {
  try {
    const response = await axiosInstance.get('/user-groups');
    return response.data;
  } catch (error) {
    console.error('Error fetching user groups:', error);
    throw error;
  }
};

/**
 * Fetches all inactive user groups
 * @returns Promise with inactive user groups and admin status
 */
export const getInactiveUserGroups = async (): Promise<UserGroupsResponse> => {
  try {
    const response = await axiosInstance.get('/user-groups/inactive/');
    return response.data;
  } catch (error) {
    console.error('Error fetching inactive user groups:', error);
    throw error;
  }
};

/**
 * Fetches information about a specific user group
 * @param userGroupId The ID of the user group to get information for
 * @returns Promise with user group information
 */
export const getUserGroupInfo = async (userGroupId: string | number): Promise<UserGroupInfoResponse> => {
  try {
    const response = await axiosInstance.get('/user-groups/info/', {
      params: { userGroupId }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching user group info:', error);
    throw error;
  }
};

/**
 * Updates the name of a user group
 * @param groupId The ID of the group to update
 * @param newName The new name for the group
 * @returns Promise with success status and optional message
 */
export const updateGroupName = async (groupId: number | string, newName: string): Promise<UpdateGroupNameResponse> => {
  try {
    const response = await axiosInstance.put('/user-groups/update-name/', {
      groupId,
      groupName: newName
    });
    return response.data;
  } catch (error) {
    console.error('Error updating group name:', error);
    throw error;
  }
};

/**
 * Updates the open date of a user group
 * @param groupId The ID of the group to update
 * @param openDate The new open date for the group (format: YYYY-MM-DD)
 * @returns Promise with success status and optional message
 */
export const updateGroupOpenDate = async (groupId: number | string, openDate: string): Promise<UpdateDateResponse> => {
  try {
    const response = await axiosInstance.put('/user-groups/update-date/', {
      groupId,
      openDate
    });
    return response.data;
  } catch (error) {
    console.error('Error updating group open date:', error);
    throw error;
  }
};

/**
 * Updates the close date of a user group
 * @param groupId The ID of the group to update
 * @param closeDate The new close date for the group (format: YYYY-MM-DD)
 * @returns Promise with success status and optional message
 */
export const updateGroupCloseDate = async (groupId: number | string, closeDate: string): Promise<UpdateDateResponse> => {
  try {
    const response = await axiosInstance.put('/user-groups/update-date/', {
      groupId,
      closeDate
    });
    return response.data;
  } catch (error) {
    console.error('Error updating group close date:', error);
    throw error;
  }
};

/**
 * Toggles the activation status of a user group
 * @param groupId The ID of the group to toggle activation status
 * @param isActive The new activation status (true for active, false for inactive)
 * @returns Promise with success status and optional message
 */
export const toggleGroupActivation = async (groupId: number | string, isActive: boolean): Promise<ToggleGroupActivationResponse> => {
  try {
    const response = await axiosInstance.put('/user-groups/toggle-activation/', {
      groupId,
      isActive
    });
    return response.data;
  } catch (error) {
    console.error('Error toggling group activation status:', error);
    throw error;
  }
};

/**
 * Searches for users across the entire system
 * @param searchQuery The search query to filter users by
 * @returns Promise with matching users information
 */
export const searchUsers = async (searchQuery: string): Promise<UserSearchResponse> => {
  try {
    const response = await axiosInstance.get('/user-groups/all-users-search', {
      params: { searchQuery }
    });
    return response.data;
  } catch (error) {
    console.error('Error searching for users:', error);
    throw error;
  }
};

/**
 * Searches for users within a specific user group
 * @param userGroupId The ID of the user group to search within
 * @param searchQuery The search query to filter users by
 * @returns Promise with matching users information
 */
export const searchUsersInGroup = async (userGroupId: string | number, searchQuery: string): Promise<UserSearchResponse> => {
  try {
    const response = await axiosInstance.get('/user-groups/user-group-search', {
      params: { userGroupId, searchQuery }
    });
    return response.data;
  } catch (error) {
    console.error('Error searching for users in group:', error);
    throw error;
  }
};

/**
 * Searches for users across the entire system
 * @param searchQuery The search query to filter users by
 * @param searchMode The search mode to filter users by
 * @returns Promise with matching users information
 */
export const searchUsersControlPage = async (searchQuery: string, searchMode: string): Promise<UserSearchResponse> => {
  try {
    const response = await axiosInstance.get('/user-control/users-search', {
      params: { searchQuery, searchMode }
    });
    return response.data;
  } catch (error) {
    console.error('Error searching for users:', error);
    throw error;
  }
};

/**
 * Searches for user request across the entire system
 * @param searchQuery The search query to filter users by
 * @returns Promise with matching users information
 */
export const searchUserRequests = async (searchQuery: string): Promise<UserSearchResponse> => {
  try {
    const response = await axiosInstance.get('/user-control/user-requests-search', {
      params: { searchQuery }
    });
    return response.data;
  } catch (error) {
    console.error('Error searching for user requests:', error);
    throw error;
  }
};

/**
 * Adds a user to a specific user group
 * @param userId The ID of the user to add to the group
 * @param groupId The ID of the group to add the user to
 * @returns Promise with success status and optional message
 */
export const addUserToGroup = async (userId: number | string, groupId: number | string): Promise<UserGroupManagementResponse> => {
  try {
    const response = await axiosInstance.post('/user-groups/add-user/', {
      userId,
      groupId
    });
    return response.data;
  } catch (error) {
    console.error('Error adding user to group:', error);
    throw error;
  }
};

/**
 * Removes a user from a specific user group
 * @param userId The ID of the user to remove from the group
 * @param groupId The ID of the group to remove the user from
 * @returns Promise with success status and optional message
 */
export const removeUserFromGroup = async (userId: number | string, groupId: number | string): Promise<UserGroupManagementResponse> => {
  try {
    const response = await axiosInstance.delete('/user-groups/remove-user/', {
      data: { 
        userId,
        groupId
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error removing user from group:', error);
    throw error;
  }
};

/**
 * Fetches lesson folders available for a specific user group
 * @param groupId The ID of the user group to get lesson folders for
 * @returns Promise with lesson folders information and admin status
 */
export const getGroupLessonFolders = async (groupId: number | string): Promise<GroupFoldersResponse> => {
  try {
    const response = await axiosInstance.get('/user-groups/lesson-folders/', {
      params: { groupId }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching lesson folders for group:', error);
    throw error;
  }
};

/**
 * Fetches test folders available for a specific user group
 * @param groupId The ID of the user group to get test folders for
 * @returns Promise with test folders information and admin status
 */
export const getGroupTestFolders = async (groupId: number | string): Promise<GroupFoldersResponse> => {
  try {
    const response = await axiosInstance.get('/user-groups/test-folders/', {
      params: { groupId }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching test folders for group:', error);
    throw error;
  }
};

/**
 * Fetches tests from a specific folder with information about which ones belong to a user group
 * @param folderId The ID of the folder to get tests from
 * @param groupId The ID of the user group to check membership against
 * @returns Promise with tests information and whether they belong to the specified group
 */
export const getFolderTestsWithGroupMembership = async (
  folderId: number | string, 
  groupId: number | string
): Promise<FolderTestsResponse> => {
  try {
    const response = await axiosInstance.get('/user-groups/folder-tests/', {
      params: { folderId, groupId }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching folder tests with group membership:', error);
    throw error;
  }
};

/**
 * Fetches lessons from a specific folder with information about which ones belong to a user group
 * @param folderId The ID of the folder to get lessons from
 * @param groupId The ID of the user group to check membership against
 * @returns Promise with lessons information and whether they belong to the specified group
 */
export const getFolderLessonsWithGroupMembership = async (
  folderId: number | string, 
  groupId: number | string
): Promise<FolderLessonsResponse> => {
  try {
    const response = await axiosInstance.get('/user-groups/folder-lessons/', {
      params: { folderId, groupId }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching folder lessons with group membership:', error);
    throw error;
  }
};

/**
 * Adds a test to a specific user group
 * @param testId The ID of the test to add to the group
 * @param groupId The ID of the group to add the test to
 * @returns Promise with success status and optional message
 */
export const addTestToGroup = async (
  testId: number | string,
  groupId: number | string
): Promise<GroupContentManagementResponse> => {
  try {
    const response = await axiosInstance.post('/user-groups/add-test/', {
      testId,
      groupId
    });
    return response.data;
  } catch (error) {
    console.error('Error adding test to group:', error);
    throw error;
  }
};

/**
 * Removes a test from a specific user group
 * @param testId The ID of the test to remove from the group
 * @param groupId The ID of the group to remove the test from
 * @returns Promise with success status and optional message
 */
export const removeTestFromGroup = async (
  testId: number | string,
  groupId: number | string
): Promise<GroupContentManagementResponse> => {
  try {
    const response = await axiosInstance.delete('/user-groups/remove-test/', {
      data: {
        testId,
        groupId
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error removing test from group:', error);
    throw error;
  }
};

/**
 * Adds a lesson to a specific user group
 * @param lessonId The ID of the lesson to add to the group
 * @param groupId The ID of the group to add the lesson to
 * @returns Promise with success status and optional message
 */
export const addLessonToGroup = async (
  lessonId: number | string,
  groupId: number | string
): Promise<GroupContentManagementResponse> => {
  try {
    const response = await axiosInstance.post('/user-groups/add-lesson/', {
      lessonId,
      groupId
    });
    return response.data;
  } catch (error) {
    console.error('Error adding lesson to group:', error);
    throw error;
  }
};

/**
 * Removes a lesson from a specific user group
 * @param lessonId The ID of the lesson to remove from the group
 * @param groupId The ID of the group to remove the lesson from
 * @returns Promise with success status and optional message
 */
export const removeLessonFromGroup = async (
  lessonId: number | string,
  groupId: number | string
): Promise<GroupContentManagementResponse> => {
  try {
    const response = await axiosInstance.delete('/user-groups/remove-lesson/', {
      data: {
        lessonId,
        groupId
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error removing lesson from group:', error);
    throw error;
  }
};

/**
 * Fetches users from a specific user group with pagination
 * @param userGroupId The ID of the user group to get users from
 * @param page The page number to fetch (default: 1)
 * @returns Promise with paginated users information, pagination metadata, and admin status
 */
export const getGroupUsersPaginated = async (
  userGroupId: string | number,
  page: number = 1
): Promise<GroupUsersPaginatedResponse> => {
  try {
    const response = await axiosInstance.get('/user-groups/users/', {
      params: { 
        userGroupId,
        page: page < 1 ? 1 : page
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching paginated group users:', error);
    throw error;
  }
};

/**
 * Fetches all users from the system with pagination
 * @param page The page number to fetch (default: 1)
 * @param mode The mode to filter users by (e.g., 'active', 'inactive', 'without group')
 * @returns Promise with paginated users information, pagination metadata, and admin status
 */
export const getAllUsersPaginated = async (
  page: number = 1,
  mode?: string
): Promise<AllUsersPaginatedResponse> => {
  try {
    const response = await axiosInstance.get('/user-control/users/', {
      params: { 
        page: page < 1 ? 1 : page,
        mode: mode
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching paginated users:', error);
    throw error;
  }
};

/**
 * Fetches main user statistics including folder progress, test statistics, and total stars
 * @returns Promise with main user statistics including folders, tests, average scores, and total stars
 */
export const getMainUserStatistics = async (): Promise<MainUserStatisticsResponse> => {
  try {
    const response = await axiosInstance.get('/user-statistics/main');
    console.log('Main user statistics response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching main user statistics:', error);
    throw error;
  }
};

/**
 * Fetches all user requests from the system with pagination
 * @param page The page number to fetch (default: 1)
 * @returns Promise with paginated user requests information, pagination metadata, and admin status
 */
export const getAllUserRequestsPaginated = async (
  page: number = 1
): Promise<UserRequestsPaginatedResponse> => {
  try {
    const response = await axiosInstance.get('/user-control/user-requests/', {
      params: { 
        page: page < 1 ? 1 : page
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching paginated user requests:', error);
    throw error;
  }
};

/**
 * Creates a new user request
 * @param requestData The data for the new user request
 * @returns Promise with success status, message, and optional request ID
 */
export const createUserRequest = async (
  requestData: CreateUserRequestPayload
): Promise<CreateUserRequestResponse> => {
  try {
    const response = await axiosInstance.post('/create-user-requests/', requestData);
    return response.data;
  } catch (error) {
    console.error('Error creating user request:', error);
    throw error;
  }
};

/**
 * Deletes a specific user request
 * @param requestId The ID of the user request to delete
 * @returns Promise with success status and optional message
 */
export const deleteUserRequest = async (
  requestId: number
): Promise<DeleteUserRequestResponse> => {
  try {
    const response = await axiosInstance.delete(`/user-control/delete-user-request/${requestId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting user request:', error);
    throw error;
  }
};

/**
 * Activates a specific user
 * @param userId The ID of the user to activate
 * @returns Promise with success status and optional message
 */
export const activateUser = async (
  userId: number | string
): Promise<UserActivationResponse> => {
  try {
    const response = await axiosInstance.put(`/user-control/activate-user/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error activating user:', error);
    throw error;
  }
};

/**
 * Deactivates a specific user and removes them from all active groups
 * @param userId The ID of the user to deactivate
 * @returns Promise with success status and optional message
 */
export const deactivateUser = async (
  userId: number | string
): Promise<UserActivationResponse> => {
  try {
    const response = await axiosInstance.put(`/user-control/deactivate-user/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error deactivating user:', error);
    throw error;
  }
};

/**
 * Updates the name of a specific user
 * @param userId The ID of the user to update
 * @param name The new name for the user
 * @returns Promise with success status and optional message
 */
export const updateUserName = async (
  userId: number | string,
  name: string
): Promise<UpdateUserNameResponse> => {
  try {
    const response = await axiosInstance.put(`/user-control/update-user-name/${userId}`, {
      name
    });
    return response.data;
  } catch (error) {
    console.error('Error updating user name:', error);
    throw error;
  }
};

/**
 * Updates the surname of a specific user
 * @param userId The ID of the user to update
 * @param surname The new surname for the user
 * @returns Promise with success status and optional message
 */
export const updateUserSurname = async (
  userId: number | string,
  surname: string
): Promise<UpdateUserSurnameResponse> => {
  try {
    const response = await axiosInstance.put(`/user-control/update-user-surname/${userId}`, {
      surname
    });
    return response.data;
  } catch (error) {
    console.error('Error updating user surname:', error);
    throw error;
  }
};

/**
 * Updates the status of a specific user request
 * @param requestId The ID of the request to update
 * @param status The new status for the request
 * @returns Promise with success status and optional message
 */
export const updateRequestStatus = async (
  requestId: number | string,
  status: string
): Promise<{ success: boolean; message?: string }> => {
  try {
    const response = await axiosInstance.put(`/user-control/update-request-status/${requestId}`, {
      status
    });
    return response.data;
  } catch (error) {
    console.error('Error updating request status:', error);
    throw error;
  }
};

/**
 * Fetches all active user groups
 * @returns Promise with active groups information including group names and IDs
 */
export const getAllActiveGroups = async (): Promise<ActiveGroupsResponse> => {
  try {
    const response = await axiosInstance.get('/user-control/active-groups/');
    return response.data;
  } catch (error) {
    console.error('Error fetching active groups:', error);
    throw error;
  }
};

/**
 * Creates multiple users and adds them to specified groups
 * @param userData The data containing users array and group IDs
 * @returns Promise with bulk creation results including success count and failed users
 */
export const bulkCreateUsers = async (
  userData: BulkCreateUsersPayload
): Promise<BulkCreateUsersResponse> => {
  try {
    const response = await axiosInstance.post('/user-control/bulk-create-users/', userData);
    return response.data;
  } catch (error) {
    console.error('Error creating users in bulk:', error);
    throw error;
  }
};

/**
 * Fetches email statistics and user creation logs
 * @returns Promise with email stats including daily limits and user creation logs
 */
export const getEmailStats = async (): Promise<EmailStatsResponse> => {
  try {
    const response = await axiosInstance.get('/user-control/email_stats/');
    return response.data;
  } catch (error) {
    console.error('Error fetching email stats:', error);
    throw error;
  }
};

/**
 * Creates a new user group
 * @param groupData The data for the new group including name and optional dates
 * @returns Promise with success status and optional message
 */
export const createNewGroup = async (
  groupData: CreateNewGroupPayload
): Promise<CreateNewGroupResponse> => {
  try {
    const response = await axiosInstance.post('/user-groups/create-new-group/', groupData);
    return response.data;
  } catch (error) {
    console.error('Error creating new group:', error);
    throw error;
  }
};

/**
 * Retrieves the password for a non-admin user (admin only function)
 * @param userId The ID of the user to get the password for
 * @returns Promise with success status, password, and optional message
 */
export const getUserPassword = async (
  userId: number | string
): Promise<GetUserPasswordResponse> => {
  try {
    const response = await axiosInstance.get(`/user-control/get-user-password/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error getting user password:', error);
    throw error;
  }
};




