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
    markedForDeletion?: boolean;
    uploadedImages?: any[]; // Array of UploadedImage objects
  }>;
}) {
  try {
    // Check if there are any uploaded images across all questions
    const hasUploadedImages = testData.questions.some(q => 
      q.uploadedImages && q.uploadedImages.length > 0
    );

    if (hasUploadedImages) {
      // Use FormData when there are uploaded images
      const formData = new FormData();
      
      // Prepare test data without the file objects for JSON serialization
      const testDataForJson = {
        test_id: testData.test_id,
        test_name: testData.test_name,
        questions: testData.questions.map((q, questionIndex) => ({
          question_id: q.question_id,
          question: q.question,
          question_type: q.question_type,
          question_data: q.question_data,
          max_points: q.max_points,
          isNew: q.isNew,
          markedForDeletion: q.markedForDeletion,
          // Include image metadata without the actual file objects
          uploadedImages: q.uploadedImages?.map((img, imgIndex) => ({
            id: img.id,
            name: img.name,
            size: img.size,
            // Reference to the file in FormData
            fileKey: `question_${questionIndex}_image_${imgIndex}`
          }))
        }))
      };

      // Add the JSON data
      formData.append('testData', JSON.stringify(testDataForJson));

      // Add all image files to FormData
      testData.questions.forEach((question, questionIndex) => {
        if (question.uploadedImages) {
          question.uploadedImages.forEach((img, imgIndex) => {
            if (img.file) {
              formData.append(`question_${questionIndex}_image_${imgIndex}`, img.file);
            }
          });
        }
      });

      const response = await axiosInstance.put('/test-edit/' + tfp_sha, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return {
        success: true,
        updatedTest: response.data
      };
    } else {
      // Use regular JSON when no images are uploaded
      const response = await axiosInstance.put('/test-edit/' + tfp_sha, testData);
      return {
        success: true,
        updatedTest: response.data
      };
    }
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

// Function to get test data by ID
export async function GetTestDataById(testId: number) {
  try {
    const response = await axiosInstance.get(`/get-test-data/${testId}`);
    return {
      success: true,
      isAdmin: response.data.is_admin,
      full_test_with_answers: response.data.full_test_with_answers
    };
  }
  catch (err) {
    console.error('Error fetching test data by ID:', err);
    return { 
      success: false, 
      error: err instanceof Error ? err.message : 'Unknown error occurred'
    };
  }
}

// Function to submit test answers by ID
export async function SubmitTestAnswersById(testId: number, answers: UserTestResponse[]) {
  try {
    const response = await axiosInstance.post(`/submit-test-data/${testId}`, {
      answers: answers
    });
    return {
      success: true,
      result: response.data
    };
  }
  catch (err) {
    console.error('Error submitting test answers by ID:', err);
    return { 
      success: false, 
      error: err instanceof Error ? err.message : 'Unknown error occurred'
    };
  }
}





