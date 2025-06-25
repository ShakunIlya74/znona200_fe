import axiosInstance from "./axiosInstance";

export interface NoteCardMeta {
  note_name: string;
  note_id: number;
  note_sha: string;
  folder_id: number;
  // Add any additional fields returned by the API
  note_description?: string;
  pdf_url?: string;
  watermarked_pdf_url?: string;

}

export interface NoteViewResponse {
  success: boolean;
  note_dict?: NoteCardMeta;
  folder_note_dicts?: NoteCardMeta[];
  error?: string;
}

export async function GetNotesData() {
  try {
    const response = await axiosInstance.get('/notes');
    return await response.data;
  }
  catch (err) {
    console.log(err);
    return {};
  }
}

export async function GetFolderNotes(folderId: number | string) {
  try {
    const response = await axiosInstance.get("/notes/folder/",
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

export async function GetNoteView(note_sha: string): Promise<NoteViewResponse> {
  try {
    const response = await axiosInstance.get('/note-view/' + note_sha);
    return {
      success: true,
      note_dict: response.data.note_dict,
      folder_note_dicts: response.data.folder_note_dicts
    };
  }
  catch (err) {
    console.error('Error fetching note view:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error occurred'
    };
  }
}