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

export interface UploadSlideResponse {
  success: boolean;
  slide_id?: number;
  url?: string;
  filename?: string;
  error?: string;
  details?: string;
}

export interface UploadWebinarResponse {
  success: boolean;
  webinar_id?: number;
  url?: string;
  filename?: string;
  error?: string;
  details?: string;
}

export interface DeleteWebinarResponse {
  success: boolean;
  message?: string;
  webinar_still_used?: boolean;
  cdn_deleted?: boolean;
  cdn_error?: string;
  error?: string;
}

export interface DeleteSlideResponse {
  success: boolean;
  message?: string;
  slide_still_used?: boolean;
  cdn_deleted?: boolean;
  cdn_error?: string;
  error?: string;
}

export interface CreateLessonResponse {
  success: boolean;
  lfp_sha?: string;
  error?: string;
}

export interface UpdateLessonTitleResponse {
  success: boolean;
  lesson_id?: number;
  lesson_name?: string;
  message?: string;
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

export async function UploadSlide(
  file: File, 
  lessonId: number | string, 
  slideTitle?: string,
  onUploadProgress?: (progressEvent: any) => void
): Promise<UploadSlideResponse> {
    try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('lesson_id', lessonId.toString());
        
        if (slideTitle) {
            formData.append('slide_title', slideTitle);
        }

        const response = await axiosInstance.post('/upload-slide', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            onUploadProgress,
        });

        return {
            success: true,
            slide_id: response.data.slide_id,
            url: response.data.url,
            filename: response.data.filename,
        };
    }
    catch (err: any) {
        console.error('Error uploading slide:', err);
        
        if (err.response?.data) {
            return {
                success: false,
                error: err.response.data.error || 'Upload failed',
                details: err.response.data.details,
            };
        }
        
        return { 
            success: false, 
            error: err instanceof Error ? err.message : 'Unknown error occurred'
        };
    }
}

export async function UploadWebinar(
  file: File,
  webinarTitle?: string,
  videoType: string = 'WEBINAR',
  lessonId?: number | string,
  onUploadProgress?: (progressEvent: any) => void
): Promise<UploadWebinarResponse> {
    try {
        const formData = new FormData();
        formData.append('file', file);
        
        if (webinarTitle) {
            formData.append('webinar_title', webinarTitle);
        }
        
        formData.append('video_type', videoType);
        
        if (lessonId) {
            formData.append('lesson_id', lessonId.toString());
        }

        const response = await axiosInstance.post('/upload-webinar', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            onUploadProgress,
        });

        return {
            success: true,
            webinar_id: response.data.webinar_id,
            url: response.data.url,
            filename: response.data.filename,
        };
    }
    catch (err: any) {
        console.error('Error uploading webinar:', err);
        
        if (err.response?.data) {
            return {
                success: false,
                error: err.response.data.error || 'Upload failed',
                details: err.response.data.details,
            };
        }
        
        return { 
            success: false, 
            error: err instanceof Error ? err.message : 'Unknown error occurred'
        };
    }
}

export async function DeleteWebinarFromLesson(
  webinarId: number | string,
  lessonId: number | string
): Promise<DeleteWebinarResponse> {
    try {
        const response = await axiosInstance.delete('/webinar/video/delete', {
            data: {
                webinar_id: webinarId,
                lesson_id: lessonId
            },
            headers: {
                'Content-Type': 'application/json',
            }
        });

        return {
            success: true,
            message: response.data.message,
            webinar_still_used: response.data.webinar_still_used,
            cdn_deleted: response.data.cdn_deleted,
            cdn_error: response.data.cdn_error,
        };
    }
    catch (err: any) {
        console.error('Error deleting webinar from lesson:', err);
        
        if (err.response?.data) {
            return {
                success: false,
                error: err.response.data.error || 'Delete failed',
            };
        }
        
        return { 
            success: false, 
            error: err instanceof Error ? err.message : 'Unknown error occurred'
        };
    }
}

export async function DeleteSlideFromLesson(
  slideId: number | string,
  lessonId: number | string
): Promise<DeleteSlideResponse> {
    try {
        const response = await axiosInstance.delete('/webinar/slide/delete', {
            data: {
                slide_id: slideId,
                lesson_id: lessonId
            },
            headers: {
                'Content-Type': 'application/json',
            }
        });

        return {
            success: true,
            message: response.data.message,
            slide_still_used: response.data.slide_still_used,
            cdn_deleted: response.data.cdn_deleted,
            cdn_error: response.data.cdn_error,
        };
    }
    catch (err: any) {
        console.error('Error deleting slide from lesson:', err);
        
        if (err.response?.data) {
            return {
                success: false,
                error: err.response.data.error || 'Delete failed',
            };
        }
        
        return { 
            success: false, 
            error: err instanceof Error ? err.message : 'Unknown error occurred'
        };
    }
}

export async function CreateLesson(folderId: number | string): Promise<CreateLessonResponse> {
    try {
        const response = await axiosInstance.post('/lesson-create', {
            folderId: folderId
        }, {
            headers: {
                'Content-Type': 'application/json',
            }
        });

        return {
            success: true,
            lfp_sha: response.data.lfp_sha,
        };
    }
    catch (err: any) {
        console.error('Error creating lesson:', err);
        
        if (err.response?.data) {
            return {
                success: false,
                error: err.response.data.error || 'Lesson creation failed',
            };
        }
        
        return { 
            success: false, 
            error: err instanceof Error ? err.message : 'Unknown error occurred'
        };
    }
}

export async function UpdateLessonTitle(
  lessonId: number | string,
  lessonName: string
): Promise<UpdateLessonTitleResponse> {
    try {
        const response = await axiosInstance.put('/lesson/update-title', {
            lesson_id: lessonId,
            lesson_name: lessonName
        }, {
            headers: {
                'Content-Type': 'application/json',
            }
        });

        return {
            success: true,
            lesson_id: response.data.lesson_id,
            lesson_name: response.data.lesson_name,
            message: response.data.message,
        };
    }
    catch (err: any) {
        console.error('Error updating lesson title:', err);
        
        if (err.response?.data) {
            return {
                success: false,
                error: err.response.data.error || 'Lesson title update failed',
            };
        }
        
        return { 
            success: false, 
            error: err instanceof Error ? err.message : 'Unknown error occurred'
        };
    }
}

