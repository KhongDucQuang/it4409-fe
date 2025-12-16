// src/pages/Auth/Register.jsx
import { useState } from 'react'
import { Box, Button, TextField, Typography, Container, Alert } from '@mui/material'
import { registerAPI } from '~/apis/authApi'
import { useNavigate, Link } from 'react-router-dom'
import { toast } from 'react-toastify'

function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState(null)
  
  const navigate = useNavigate() 

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp!')
      return
    }
    if (password.length < 6) {
        setError('Mật khẩu phải có ít nhất 6 ký tự!')
        return
    }
    setError(null)

    try {
      // Gọi API đăng ký
      await registerAPI({ email, password, name })
      
      // Thông báo thành công
      toast.success('Đăng ký thành công! Hãy đăng nhập.')
      
      // Chuyển hướng về trang Login
      navigate('/login')

    } catch (err) {
      // Xử lý lỗi từ Backend trả về
      setError(err?.response?.data?.message || 'Đăng ký thất bại!')
      toast.error('Đăng ký thất bại')
    }
  }

  return (
  <Container maxWidth="xs">
    <Box
      sx={{
        marginTop: 10,
        padding: 4,
        borderRadius: 3,
        boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
        backgroundColor: '#fff',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}
    >
      <Typography
        component="h1"
        variant="h5"
        sx={{ fontWeight: 600, mb: 1 }}
      >
        Đăng ký
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Tạo tài khoản Trello 
      </Typography>

      <Box component="form" sx={{ width: '100%' }} noValidate>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <TextField
          label="Họ và tên"
          fullWidth
          required
          autoFocus
          margin="normal"
          value={name}
          onChange={(e) => setName(e.target.value)}
          InputLabelProps={{ shrink: true }}
        />

        <TextField
          label="Email"
          fullWidth
          required
          margin="normal"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          InputLabelProps={{ shrink: true }}
        />

        <TextField
          label="Mật khẩu"
          type="password"
          fullWidth
          required
          margin="normal"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          InputLabelProps={{ shrink: true }}
        />

        <TextField
          label="Xác nhận mật khẩu"
          type="password"
          fullWidth
          required
          margin="normal"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          InputLabelProps={{ shrink: true }}
        />

        <Button
          fullWidth
          variant="contained"
          size="large"
          sx={{
            mt: 3,
            mb: 2,
            py: 1.2,
            fontWeight: 600,
            borderRadius: 2
          }}
          onClick={handleRegister}
        >
          Đăng ký
        </Button>

        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2">
            Đã có tài khoản?{' '}
            <Link
              to="/login"
              style={{ textDecoration: 'none', fontWeight: 600 }}
            >
              Đăng nhập ngay
            </Link>
          </Typography>
        </Box>
      </Box>
    </Box>
  </Container>
)

}

export default Register