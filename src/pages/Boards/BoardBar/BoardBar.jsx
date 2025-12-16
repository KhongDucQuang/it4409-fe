import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import DashboardIcon from '@mui/icons-material/Dashboard'
import VpnLockIcon from '@mui/icons-material/VpnLock'
import AddToDriveIcon from '@mui/icons-material/AddToDrive'
import Avatar from '@mui/material/Avatar'
import AvatarGroup from '@mui/material/AvatarGroup'
import { Tooltip, Button, Popover, TextField, Typography } from '@mui/material'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import { useState } from 'react'
import { inviteUserToBoardAPI } from '~/apis/boardApi'
import { toast } from 'react-toastify'

function BoardBar({ board, onBoardUpdate }) {
  // State xử lý Invite
  const [anchorElInvite, setAnchorElInvite] = useState(null)
  const openInvite = Boolean(anchorElInvite)
  const [emailInvite, setEmailInvite] = useState('')
  const [isInviting, setIsInviting] = useState(false)

  const handleInviteUser = async () => {
    if (!emailInvite.trim()) {
      toast.warning('Vui lòng nhập email')
      return
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(emailInvite)) {
      toast.warning('Email không hợp lệ')
      return
    }

    setIsInviting(true)
    
    try {
      const response = await inviteUserToBoardAPI(board._id, emailInvite)
      
      console.log('✅ Invite response:', response)
      
      toast.success('Đã mời thành viên thành công!')
      setEmailInvite('')
      setAnchorElInvite(null)
      
      // Reload page để cập nhật members
      setTimeout(() => {
        window.location.reload()
      }, 1000)
      
    } catch (error) {
      console.error('❌ Invite error:', error)
      
      // Xử lý các loại lỗi cụ thể
      if (error?.response?.status === 404) {
        toast.error('Không tìm thấy người dùng với email này')
      } else if (error?.response?.status === 409) {
        toast.error('Người dùng đã có trong board')
      } else if (error?.response?.status === 400) {
        toast.error(error?.response?.data?.message || 'Yêu cầu không hợp lệ')
      } else {
        toast.error('Có lỗi xảy ra khi mời người dùng')
      }
    } finally {
      setIsInviting(false)
    }
  }

  // Handle Enter key
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isInviting) {
      handleInviteUser()
    }
  }

  return (
    <Box sx={{
      width: '100%',
      height: (theme) => theme.trello.boardBarHeight,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 2,
      paddingX: 2,
      overflowX: 'auto',
      bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#34495e' : '#1976d2'),
      borderBottom: '1px solid white'
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Chip 
          sx={{ 
            color: 'white', 
            bgcolor: 'transparent', 
            border: 'none', 
            paddingX: '5px', 
            borderRadius: '4px', 
            '& .MuiSvgIcon-root': { color: 'white' }, 
            '&:hover': { bgcolor: 'primary.50' } 
          }}
          icon={<DashboardIcon />} 
          label={board?.title} 
          clickable 
        />
        <Chip 
          sx={{ 
            color: 'white', 
            bgcolor: 'transparent', 
            border: 'none', 
            paddingX: '5px', 
            borderRadius: '4px', 
            '& .MuiSvgIcon-root': { color: 'white' }, 
            '&:hover': { bgcolor: 'primary.50' } 
          }}
          icon={<VpnLockIcon />} 
          label={board?.type} 
          clickable 
        />
        <Chip 
          sx={{ 
            color: 'white', 
            bgcolor: 'transparent', 
            border: 'none', 
            paddingX: '5px', 
            borderRadius: '4px', 
            '& .MuiSvgIcon-root': { color: 'white' }, 
            '&:hover': { bgcolor: 'primary.50' } 
          }}
          icon={<AddToDriveIcon />} 
          label="Add to Google Drive" 
          clickable 
        />
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {/* NÚT INVITE */}
        <Button 
          variant="outlined" 
          startIcon={<PersonAddIcon />}
          sx={{ 
            color: 'white', 
            borderColor: 'white', 
            '&:hover': { 
              borderColor: 'white', 
              bgcolor: 'white', 
              color: 'primary.main' 
            } 
          }}
          onClick={(e) => setAnchorElInvite(e.currentTarget)}
        >
          Invite
        </Button>
        
        {/* POPOVER FORM INVITE */}
        <Popover
          open={openInvite}
          anchorEl={anchorElInvite}
          onClose={() => {
            setAnchorElInvite(null)
            setEmailInvite('')
          }}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          PaperProps={{
            sx: {
              borderRadius: '8px',
              boxShadow: '0 8px 16px rgba(0,0,0,0.15)'
            }
          }}
        >
          <Box sx={{ p: 2.5, width: '320px' }}>
            <Typography 
              variant="h6" 
              sx={{ 
                mb: 2, 
                fontSize: '1rem', 
                fontWeight: 600,
                color: '#172b4d'
              }}
            >
              Mời người vào Board
            </Typography>
            
            <TextField 
              fullWidth 
              placeholder="email@example.com"
              size="small" 
              value={emailInvite} 
              onChange={(e) => setEmailInvite(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isInviting}
              autoFocus
              sx={{ mb: 2 }}
            />
            
            <Button 
              variant="contained" 
              fullWidth 
              onClick={handleInviteUser}
              disabled={isInviting || !emailInvite.trim()}
              sx={{
                textTransform: 'none',
                bgcolor: '#0079bf',
                '&:hover': {
                  bgcolor: '#026aa7'
                }
              }}
            >
              {isInviting ? 'Đang mời...' : 'Mời'}
            </Button>
          </Box>
        </Popover>

        <AvatarGroup 
          max={4} 
          sx={{ 
            '& .MuiAvatar-root': { 
              width: 34, 
              height: 34, 
              fontSize: 16, 
              border: 'none' 
            } 
          }}
        >
          {board?.members?.map((member, index) => (
            <Tooltip key={index} title={member.user?.name}>
              <Avatar alt={member.user?.name} src={member.user?.avatarUrl} />
            </Tooltip>
          ))}
        </AvatarGroup>
      </Box>
    </Box>
  )
}

export default BoardBar