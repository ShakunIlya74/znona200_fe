import axiosInstance from "./axiosInstance";

export interface TestViewResponse {
  success: boolean;
  test_dict?: TestCardMeta;
  error?: string;
}

export interface TestCardMeta {
  test_name: string;
  test_id: number;
  tfp_sha: string;
  // Add any additional fields returned by the API
}

export async function GetTestsData() {
    try {
        const response = await axiosInstance.get('/tests');
        return await response.data;
    }
    catch (err) {
        console.log(err);
        return {};
    }
}

export async function GetFolderTests(folderId: number | string) {
    try {
        const response = await axiosInstance.get("/tests/folder/",
            {
                params: {
                  ...(folderId ? { folderId: folderId } : {}),
                }
            }
        );

        return await response.data;
    }
    catch (err) {
        console.log(err);
        return { success: false, error: err };
    }
}


export async function GetTestView(tfp_sha: string): Promise<TestViewResponse> {
    try {
      const response = await axiosInstance.get('/test-view/' + tfp_sha);
      return {
        success: true,
        test_dict: response.data.test_dict
      };
    }
    catch (err) {
      console.error('Error fetching test view:', err);
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Unknown error occurred'
      };
    }
  };

