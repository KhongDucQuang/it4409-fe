// src/pages/Auth/Login.jsx
import { useState } from 'react';
import { Box, Button, TextField, Typography, Container, Alert } from '@mui/material';
import { loginAPI } from '~/apis/authApi';
import { useNavigate, Link } from 'react-router-dom'; 
import { toast } from 'react-toastify';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await loginAPI({ email, password });
      localStorage.setItem('accessToken', res.token);
      localStorage.setItem('userInfo', JSON.stringify(res.user));
      toast.success('Đăng nhập thành công!');
      navigate('/boards');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Đăng nhập thất bại!');
    }
  };

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
        Đăng nhập
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Trello – IT4409
      </Typography>

      <Box component="form" sx={{ width: '100%' }}>
        <TextField
          label="Email"
          fullWidth
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          InputLabelProps={{
            shrink: true
          }}
        />


        <TextField
          margin="normal"
          required
          fullWidth
          label="Mật khẩu"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          InputLabelProps={{
            shrink: true
          }}
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
          onClick={handleLogin}
        >
          Đăng nhập
        </Button>

        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2">
            Chưa có tài khoản?{' '}
            <Link
              to="/register"
              style={{ textDecoration: 'none', fontWeight: 600 }}
            >
              Đăng ký ngay
            </Link>
          </Typography>
        </Box>
      </Box>
    </Box>
  </Container>
);

}

export default Login;