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

