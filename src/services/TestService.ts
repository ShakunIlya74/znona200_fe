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

