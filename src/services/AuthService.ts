import axiosInstance from "./axiosInstance";


// export async function Login(key: string) {
//     try {
//         const response = await axiosInstance.get('/login/' + key);
//         return await response.data;
//     }
//     catch (err) {
//         console.log(err);
//         return {};
//     }
// } 

export async function SendLoginData(email: string, password: string) {
    try {
      const response = await axiosInstance.post('/password_login', {
        email: email,
        password: password
      });
      return await response.data;
    }
    catch (err) {
      console.log(err);
      return {};
    }
  }

  export async function GetSessionData() {
    try {
      const response = await axiosInstance.get('/session_info');
      return await response.data;
    }
    catch (err) {
      console.log(err);
      return {};
    }
  }

//   export async function SendResetPassword(password: string, sha_key: string) {
//     try {
//       const response = await axiosInstance.post('/reset_password/' + sha_key, {
//         password: password,
//       });
//       return await response.data;
//     }
//     catch (err) {
//       console.log(err);
//       return {};
//     }
//   }