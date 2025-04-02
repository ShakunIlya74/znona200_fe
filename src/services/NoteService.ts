import axiosInstance from "./axiosInstance";

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