import axiosInstance from "./axiosInstance";

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