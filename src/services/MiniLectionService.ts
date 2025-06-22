import axiosInstance from "./axiosInstance";

export interface MiniLectionCardMeta {
  minilection_name: string;
  minilection_id: number;
  minilection_sha: string;
  folder_id: number;
  minilection_description?: string;
  minilection_url?: string;
  created_at?: string;
  // Add any additional fields returned by the API
}

export interface MiniLectionViewResponse {
  success: boolean;
  minilection_dict?: MiniLectionCardMeta;
  folder_minilection_dicts?: MiniLectionCardMeta[];
  error?: string;
}

export async function GetMiniLectionsData() {
    try {
        const response = await axiosInstance.get('/minilections');
        return await response.data;
    }
    catch (err) {
        console.log(err);
        return {};
    }
}

export async function GetFolderMiniLections(folderId: number | string) {
    try {
        const response = await axiosInstance.get("/minilections/folder/",
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

export async function GetMiniLectionView(minilection_sha: string): Promise<MiniLectionViewResponse> {
    try {
      const response = await axiosInstance.get('/minilection-view/' + minilection_sha);
      return {
        success: true,
        ...response.data
      };
    }
    catch (err) {
      console.error('Error fetching minilection view:', err);
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Unknown error occurred'
      };
    }
}