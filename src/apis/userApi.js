
import axios from 'axios' // Hoặc import instance axios đã config của bạn
import { API_ROOT } from '~/utils/constants' // Đường dẫn gốc API ví dụ: http://localhost:8017

// 1. Lấy thông tin user hiện tại
export const fetchCurrentUserAPI = async () => {
  const response = await axios.get(`${API_ROOT}/api/users/me`)
  return response.data
}

// 2. Cập nhật thông tin user
export const updateCurrentUserAPI = async (formData) => {
  const token = localStorage.getItem('accessToken')
  
  // Lưu ý: Khi gửi FormData, không cần thủ công set 'Content-Type': 'multipart/form-data',
  // axios sẽ tự động làm việc đó.
  const response = await axios.patch(`${API_ROOT}/api/users/me`, formData, {
     headers: { 
       Authorization: `Bearer ${token}`
       // 'Content-Type': 'multipart/form-data' // <-- Axios tự động thêm cái này khi data là FormData
     }
  })
  return response.data
}