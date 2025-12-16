// src/apis/index.js
import axios from '../utils/axiosCustom' // Import từ file custom đã cấu hình

// Không cần import API_ROOT nữa vì axiosCustom đã tự xử lý baseURL rồi

// Hàm toggle nhãn
export const toggleLabelAPI = async (data) => {
  // data bao gồm: { cardId, boardId, color, name }
  
  // SỬA 1: Bỏ ${API_ROOT}, chỉ để đường dẫn đuôi (/api/...)
  const response = await axios.put('/api/labels/toggle', data)
  
  // SỬA 2: Trả về response luôn (vì axiosCustom đã lọc lấy .data rồi)
  return response
}