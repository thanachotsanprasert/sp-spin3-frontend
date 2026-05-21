<<<<<<< HEAD
<<<<<<< HEAD
import api from "../utils/api";

export const loginAPI = async (username, password) => {
  try {
    const response = await api.post("/auth/login", { username, password });
    // Assuming the backend returns an object with a token and user info
    if (response.token) {
      localStorage.setItem("token", response.token);
    }
    return response;
  } catch (err) {
    console.error("Auth Service Error:", err);
    throw new Error(err.message || "ระบบตรวจสอบข้อมูลขัดข้อง");
  }
=======
=======
>>>>>>> 19793467f7de4b065a90b30e0d9447f1939f4d56
// จำลองการเรียก API ขึ้นมาคั่นกลาง เวลาย้ายไปใช้ B/E จะได้แก้แค่ไฟล์นี้ไฟล์เดียว

import { usersInfo } from "../assets/usersInfo";

console.log("Check Data:", usersInfo);

export const loginAPI = async (username, password) => {
  // จำลองความหน่วงของเน็ต 1 วินาที (1000 ms)
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        const user = usersInfo.find(
          (u) => u.username === username && u.password === password,
        );

        if (user) {
          console.log("Login Success:", user);
          resolve(user);
        } else {
          reject(new Error("Username หรือ Password ไม่ถูกต้อง"));
        }
      } catch (err) {
        // ป้องกันกรณีตัวแปร usersInfo พังหรือ import พลาด
        console.error("Auth Service Error:", err);
        reject(new Error("ระบบตรวจสอบข้อมูลขัดข้อง"));
      }
    }, 1000);
  });
<<<<<<< HEAD
>>>>>>> 19793467f7de4b065a90b30e0d9447f1939f4d56
=======
>>>>>>> 19793467f7de4b065a90b30e0d9447f1939f4d56
};
