// src/utils/axiosCustom.js
import axios from 'axios'
import { API_ROOT } from './constants' // Đảm bảo đường dẫn import đúng file constants

const instance = axios.create({
  baseURL: API_ROOT,
  timeout: 1000 * 60 * 5, // 5 phút
  // withCredentials: true, // Bật lên nếu dùng Cookies, nếu dùng LocalStorage thì comment lại
})

// --- 1. REQUEST INTERCEPTOR (Gửi đi) ---
// Can thiệp vào request trước khi gửi lên Server
instance.interceptors.request.use(function (config) {
    // Lấy token từ LocalStorage (hoặc nơi bạn lưu token)
    const accessToken = localStorage.getItem('accessToken') // Tên key tùy bạn đặt lúc login
    
    if (accessToken) {
      // Gán token vào header Authorization theo chuẩn: Bearer <token>
      config.headers.Authorization = `Bearer ${accessToken}`
    }

    return config
  }, function (error) {
    return Promise.reject(error)
  }
)

// --- 2. RESPONSE INTERCEPTOR (Nhận về) ---
// Can thiệp vào response khi Server trả về
instance.interceptors.response.use(function (response) {
    // Trả về luôn data.data hoặc data tùy cấu trúc server
    // Giúp Frontend gọi api chỉ cần biến.data là lấy được dữ liệu
    return response && response.data ? response.data : response
  }, function (error) {
    // Xử lý lỗi tập trung (ví dụ 401 thì logout)
    if (error.response && error.response.status === 401) {
      // Xử lý logout nếu cần
      // console.log('Hết hạn token, vui lòng login lại')
    }
    return Promise.reject(error)
  }
)

export default instance