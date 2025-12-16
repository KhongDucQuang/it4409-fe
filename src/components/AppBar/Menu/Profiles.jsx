// src/components/AppBar/Menus/Profiles.jsx
import { useState, useEffect, useRef } from 'react'
import { 
  Box, Menu, MenuItem, ListItemIcon, Divider, IconButton, Tooltip, Avatar, 
  Typography, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, LinearProgress, Stack 
} from '@mui/material'
import PersonAdd from '@mui/icons-material/PersonAdd'
import Settings from '@mui/icons-material/Settings'
import Logout from '@mui/icons-material/Logout'
import EditIcon from '@mui/icons-material/Edit'
import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import CloudUploadIcon from '@mui/icons-material/CloudUpload' // Icon upload
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

import { fetchCurrentUserAPI, updateCurrentUserAPI } from '~/apis/userApi'

function Profiles() {
  const [anchorEl, setAnchorEl] = useState(null)
  const [currentUser, setCurrentUser] = useState(null)
  const [openModal, setOpenModal] = useState(false)
  const [loading, setLoading] = useState(false)
  
  // State cho các trường text
  const [formData, setFormData] = useState({
    name: '',
    bio: ''
    // Không lưu avatarUrl ở đây nữa vì ta dùng file thực tế
  })

  // 👇 STATE MỚI CHO VIỆC UPLOAD ẢNH
  const [selectedFile, setSelectedFile] = useState(null) // Lưu file thực tế
  const [previewUrl, setPreviewUrl] = useState(null) // Lưu URL xem trước tạm thời
  const fileInputRef = useRef(null) // Ref để kích hoạt input file ẩn

  const navigate = useNavigate()
  const open = Boolean(anchorEl)

  // 1. Fetch dữ liệu user khi component mount (Giữ nguyên)
  useEffect(() => {
    const fetchUser = async () => {
        try {
            const user = await fetchCurrentUserAPI()
            if (user) {
                setCurrentUser(user)
                setFormData({ 
                    name: user.name || '', 
                    bio: user.bio || ''
                })
                localStorage.setItem('userInfo', JSON.stringify(user))
            }
        } catch (error) {
            console.error('Không lấy được user', error)
            const storedUser = localStorage.getItem('userInfo')
            if (storedUser) setCurrentUser(JSON.parse(storedUser))
        }
    }
    fetchUser()
  }, [])

  // Cleanup URL xem trước để tránh memory leak khi component unmount hoặc file thay đổi
  useEffect(() => {
    return () => {
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl)
        }
    }
  }, [previewUrl])

  const handleClick = (event) => setAnchorEl(event.currentTarget)
  const handleClose = () => setAnchorEl(null)

  const handleLogout = () => {
    localStorage.removeItem('userInfo')
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    navigate('/login')
  }

  const handleOpenModal = () => {
    handleClose()
    // Reset lại các state liên quan đến file khi mở modal
    setSelectedFile(null)
    setPreviewUrl(null)
    setOpenModal(true)
  }

  const handleCloseModal = () => setOpenModal(false)

  const handleChangeForm = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  // 👇 HÀM MỚI: Xử lý khi người dùng chọn file ảnh
  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
        // Validate loại file (chỉ cho phép ảnh)
        if (!file.type.startsWith('image/')) {
            toast.error('Vui lòng chỉ chọn file ảnh!')
            return
        }
        // Validate kích thước (ví dụ < 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error('File ảnh quá lớn (Tối đa 5MB)!')
            return
        }

        setSelectedFile(file)
        // Tạo URL xem trước cục bộ
        const objectUrl = URL.createObjectURL(file)
        setPreviewUrl(objectUrl)
    }
  }

  // 👇 HÀM SUBMIT ĐƯỢC SỬA ĐỔI ĐỂ GỬI FORMDATA
  const handleSubmitUpdate = async () => {
    setLoading(true)
    try {
      // 1. Tạo đối tượng FormData
      const dataToSend = new FormData()
      dataToSend.append('name', formData.name)
      dataToSend.append('bio', formData.bio)
      
      // 2. Nếu có chọn file mới thì thêm vào
      if (selectedFile) {
        // 'avatar' là tên field mà backend mong đợi. 
        // Hãy hỏi backend xem họ đặt tên field này là gì (ví dụ: 'image', 'file', 'avatar')
        dataToSend.append('avatar', selectedFile) 
      }

      // 3. Gọi API với FormData
      const updatedUser = await updateCurrentUserAPI(dataToSend)
      
      setCurrentUser(updatedUser)
      localStorage.setItem('userInfo', JSON.stringify(updatedUser))
      toast.success('Cập nhật thành công!')
      setOpenModal(false)
    } catch (error) {
      console.error(error)
      toast.error('Lỗi cập nhật! Vui lòng kiểm tra lại backend.')
    } finally {
      setLoading(false)
    }
  }

  const firstLetter = currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'U'
  
  // Logic hiển thị Avatar trong Modal: Ưu tiên ảnh xem trước, nếu không có thì dùng ảnh hiện tại
  const avatarSrcInModal = previewUrl || currentUser?.avatarUrl

  return (
    <Box>
      {/* ... Phần nút trên AppBar và Menu giữ nguyên ... */}
      <Tooltip title="Account settings">
        <IconButton
          onClick={handleClick}
          size="small"
          sx={{ padding: 0 }}
          aria-controls={open ? 'account-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={open ? 'true' : undefined}
        >
          <Avatar 
            sx={{ width: 36, height: 36, border: '1px solid white' }} 
            alt={currentUser?.name || 'User'} 
            src={currentUser?.avatarUrl}
          >
             {firstLetter}
          </Avatar>
        </IconButton>
      </Tooltip>

      <Menu
        id="account-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
            mt: 1.5,
            width: 280,
            '& .MuiAvatar-root': { width: 32, height: 32, ml: -0.5, mr: 1 },
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ px: 2, py: 1.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar src={currentUser?.avatarUrl} sx={{ width: 48, height: 48 }} >{firstLetter}</Avatar>
            <Box sx={{ overflow: 'hidden' }}>
                <Typography variant="subtitle1" noWrap fontWeight="bold" sx={{ color: '#172b4d' }}>
                    {currentUser?.name || 'User'}
                </Typography>
                <Typography variant="body2" noWrap sx={{ color: '#5e6c84', fontSize: '12px' }}>
                    {currentUser?.email || 'No email'}
                </Typography>
            </Box>
        </Box>

        <Divider />
        <MenuItem onClick={handleOpenModal}>
          <ListItemIcon><AccountCircleIcon fontSize="small" /></ListItemIcon>
          My Profile & Account
        </MenuItem>
        <MenuItem onClick={handleClose}>
          <ListItemIcon><Settings fontSize="small" /></ListItemIcon>
          Settings
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout} sx={{ color: '#d32f2f' }}>
          <ListItemIcon><Logout fontSize="small" sx={{ color: '#d32f2f' }} /></ListItemIcon>
          Logout
        </MenuItem>
      </Menu>

      {/* --- MODAL EDIT PROFILE (ĐÃ SỬA ĐỔI CHO UPLOAD) --- */}
      <Dialog open={openModal} onClose={handleCloseModal} fullWidth maxWidth="sm">
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <EditIcon color="primary" /> Update Profile
        </DialogTitle>
        <DialogContent dividers>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
                
                {/* Khu vực Upload Ảnh */}
                <Stack direction="row" alignItems="center" spacing={2}>
                    <Avatar src={avatarSrcInModal} sx={{ width: 80, height: 80, border: '2px solid #e0e0e0' }} >{firstLetter}</Avatar>
                    <Box>
                        <input 
                            type="file" 
                            accept="image/*" 
                            style={{ display: 'none' }} 
                            ref={fileInputRef}
                            onChange={handleFileChange}
                        />
                        <Button 
                            variant="outlined" 
                            startIcon={<CloudUploadIcon />}
                            onClick={() => fileInputRef.current.click()}
                            size="small"
                            sx={{ mb: 1 }}
                        >
                            Upload new photo
                        </Button>
                        <Typography variant="caption" display="block" color="text.secondary">
                            Allowed *.jpeg, *.jpg, *.png, *.gif
                            <br/> max size of 5 MB
                        </Typography>
                    </Box>
                </Stack>
                
                {/* Các trường text */}
                <TextField 
                    fullWidth 
                    label="Display Name" 
                    name="name"
                    value={formData.name} 
                    onChange={handleChangeForm}
                    variant="outlined" 
                />
                <TextField 
                    fullWidth 
                    label="Bio" 
                    name="bio"
                    value={formData.bio} 
                    onChange={handleChangeForm}
                    multiline 
                    rows={3}
                    variant="outlined" 
                />
            </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
            <Button onClick={handleCloseModal} color="inherit">Cancel</Button>
            <Button onClick={handleSubmitUpdate} variant="contained" disabled={loading}>
                {loading ? 'Updating...' : 'Save Changes'}
            </Button>
        </DialogActions>
        {loading && <LinearProgress sx={{ position: 'absolute', bottom: 0, left: 0, right: 0 }} />}
      </Dialog>
    </Box>
  )
}

export default Profiles