// src/utils/constants.js
let apiRoot = ''

// Kiểm tra môi trường
if (process.env.NODE_ENV === 'development' || import.meta.env.MODE === 'development') {
  // Localhost
  apiRoot = 'http://localhost:3000'
} else {
  // Production (Render)
  // 👇 Đã điền link của bạn vào đây (nhớ là mình đã bỏ dấu / ở cuối)
  apiRoot = 'https://it4409-be-ef32.onrender.com'
}

export const API_ROOT = apiRoot
