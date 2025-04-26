import axiosInstance from "./axiosInstance";
import { TestCardMeta } from "../pages/tests/interfaces";

export interface LessonCardMeta {
  lesson_name: string;
  lesson_id: number;
  lfp_sha: string;
  folder_id: number;
  description?: string;
  duration?: string;
  date?: string;
  // Add any additional fields returned by the API
}

export interface WebinarDict {
  webinar_id: number;
  webinar_title?: string;
  url: string;
  video_type?: string;
}

export interface SlideDict {
  slide_id: number;
  slide_title: string;
  slide_type: string;
  slide_content: string;
}

export interface LessonViewResponse {
  success: boolean;
  is_admin?: boolean;
  webinar_card?: LessonCardMeta;
  folder_lesson_dicts?: LessonCardMeta[];
  webinar_dicts?: WebinarDict[];
  slide_dicts?: SlideDict[];
  test_cards?: TestCardMeta[];
  error?: string;
}

export async function GetLessonsData() {
    try {
        const response = await axiosInstance.get('/webinars');
        return await response.data;
    }
    catch (err) {
        console.log(err);
        return {};
    }
}

export async function GetFolderLessons(folderId: number | string) {
    try {
        const response = await axiosInstance.get("/webinars/folder/",
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

export async function GetLessonView(lfp_sha: string): Promise<LessonViewResponse> {
    try {
      const response = await axiosInstance.get('/webinar-view/' + lfp_sha);
      return {
        success: true,
        is_admin: response.data.is_admin,
        webinar_card: response.data.webinar_card,
        folder_lesson_dicts: response.data.folder_lesson_dicts,
        webinar_dicts: response.data.webinar_dicts,
        slide_dicts: response.data.slide_dicts,
        test_cards: response.data.test_cards,
      };
    }
    catch (err) {
      console.error('Error fetching lesson view:', err);
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Unknown error occurred'
      };
    }
}