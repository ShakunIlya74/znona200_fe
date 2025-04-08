import { TestViewResponse, UserTestResponse, FullTestWithAnswers } from "../pages/tests/interfaces";
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

// Function to create a new empty test in a specified folder
export async function CreateEmptyTest(folderId: number | string) {
  try {
    const response = await axiosInstance.post('/tests-create', {
      folderId: folderId
    });
    return {
      success: true,
      tfp_sha: response.data.tfp_sha
    };
  }
  catch (err) {
    console.error('Error creating empty test:', err);
    return { 
      success: false, 
      error: err instanceof Error ? err.message : 'Unknown error occurred'
    };
  }
}

// Function to save an edited test
export async function SaveEditedTest(tfp_sha: string, testData: {
  test_id?: number;
  test_name: string;
  questions: Array<{
    question_id?: number;
    question: string;
    question_type: string;
    question_data: any;
    max_points: number;
    isNew?: boolean;
  }>;
}) {
  try {
    const response = await axiosInstance.put('/test-edit/' + tfp_sha, testData);
    return {
      success: true,
      updatedTest: response.data
    };
  }
  catch (err) {
    console.error('Error saving edited test:', err);
    return { 
      success: false, 
      error: err instanceof Error ? err.message : 'Unknown error occurred'
    };
  }
}

// Function to delete a test from a folder
export async function RemoveTestFromFolder(tfp_sha: string) {
  try {
    const response = await axiosInstance.delete('/test-remove-tfp/' + tfp_sha);
    return {
      success: true,
      message: response.data.message || 'Test deleted successfully'
    };
  }
  catch (err) {
    console.error('Error deleting test:', err);
    return { 
      success: false, 
      error: err instanceof Error ? err.message : 'Unknown error occurred'
    };
  }
}





