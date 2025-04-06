import { TestViewResponse, UserTestResponse } from "../pages/tests/interfaces";
import axiosInstance from "./axiosInstance";

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
        // test_dict: response.data.test_dict,
        full_test_with_answers: response.data.full_test_with_answers
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

export async function SubmitTestAnswers(tfp_sha: string, answers: UserTestResponse[]) {
  try {
    const response = await axiosInstance.post('/test-submit/' + tfp_sha, {
      answers: answers
    });
    return {
      success: true,
      result: response.data
    };
  }
  catch (err) {
    console.error('Error submitting test answers:', err);
    return { 
      success: false, 
      error: err instanceof Error ? err.message : 'Unknown error occurred'
    };
  }
}

