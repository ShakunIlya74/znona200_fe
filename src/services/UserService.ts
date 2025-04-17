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

