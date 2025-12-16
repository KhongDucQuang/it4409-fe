// src/components/AppBar/Notifications/Notifications.jsx - FIXED VERSION
import { useState, useEffect } from 'react'
import { Badge, Box, IconButton, Tooltip, Menu, MenuItem, Typography, Button, Avatar } from '@mui/material'
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone'
import DoneAllIcon from '@mui/icons-material/DoneAll'
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord'
import { fetchNotificationsAPI, markNotificationAsReadAPI, markAllAsReadAPI } from '~/apis/notificationApi'
import moment from 'moment'
import { socket } from '~/socket'

function Notifications() {
  const [notifications, setNotifications] = useState([])
  const [anchorEl, setAnchorEl] = useState(null)
  const open = Boolean(anchorEl)

  const fetchNotifications = async () => {
    try {
      const res = await fetchNotificationsAPI()
      setNotifications(Array.isArray(res) ? res : res.data)
    } catch (error) {
      console.error('Failed to fetch notifications')
    }
  }

  useEffect(() => {
    // Fetch notifications ban đầu
    fetchNotifications()

    // ⚠️ QUAN TRỌNG: Listener này luôn hoạt động ngay cả khi dropdown đóng
    const handleNewNotification = (data) => {
      console.log('🔔 Received notification via socket:', data)
      
      const notification = data.notification
      if (!notification) return

      // 1. Thêm vào danh sách notifications (real-time update)
      setNotifications(prev => [notification, ...prev])

      // 2. Tự động fetch lại để đảm bảo đồng bộ
      setTimeout(() => {
        fetchNotifications()
      }, 500)
    }

    socket.on('BE_NEW_NOTIFICATION', handleNewNotification)

    // Cleanup khi component unmount
    return () => {
      socket.off('BE_NEW_NOTIFICATION', handleNewNotification)
    }
  }, []) // ✅ Chỉ chạy 1 lần khi component mount
  
  const handleClickNotificationIcon = (event) => {
    setAnchorEl(event.currentTarget)
    fetchNotifications()
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleMarkAsRead = async (notification) => {
    if (!notification.isRead) {
      await markNotificationAsReadAPI(notification.id)
      setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, isRead: true } : n))
    }
  }

  const handleMarkAllAsRead = async () => {
    await markAllAsReadAPI()
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
  }

  const unreadCount = notifications?.filter(n => !n.isRead)?.length || 0

  return (
    <Box>
      <Tooltip title="Notifications">
        <IconButton 
          color="inherit" 
          onClick={handleClickNotificationIcon}
          sx={{
            transition: 'all 0.2s',
            '&:hover': { color: 'white', transform: 'scale(1.1)' }
          }}
        >
          <Badge badgeContent={unreadCount} color="error">
            <NotificationsNoneIcon sx={{ color: 'white' }} />
          </Badge>
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        id="notification-menu"
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 4px 20px rgba(0,0,0,0.15))',
            mt: 1.5,
            width: 400,
            maxHeight: 500,
            borderRadius: '12px',
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
            '&::-webkit-scrollbar': { width: '8px' },
            '&::-webkit-scrollbar-thumb': { backgroundColor: '#dfe1e6', borderRadius: '8px' },
            '&::-webkit-scrollbar-track': { backgroundColor: 'transparent' }
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {/* HEADER */}
        <Box sx={{ 
          p: 2, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          borderBottom: '1px solid #ebecf0',
          position: 'sticky',
          top: 0,
          bgcolor: 'white',
          zIndex: 1
        }}>
          <Typography variant="h6" fontSize="1.1rem" fontWeight="bold" sx={{ color: '#172b4d' }}>
            Notifications
          </Typography>
          
          {unreadCount > 0 && (
            <Tooltip title="Mark all as read">
              <Button 
                size="small" 
                startIcon={<DoneAllIcon />} 
                onClick={(e) => { e.stopPropagation(); handleMarkAllAsRead() }}
                sx={{ textTransform: 'none', fontSize: '12px' }}
              >
                Mark all read
              </Button>
            </Tooltip>
          )}
        </Box>

        {/* LIST NOTIFICATIONS */}
        <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
          {!notifications || notifications.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <img 
                src="https://cdni.iconscout.com/illustration/premium/thumb/empty-notification-2944327-2470719.png" 
                alt="Empty" 
                style={{ width: '120px', marginBottom: '10px', opacity: 0.7 }} 
              />
              <Typography variant="body1" fontWeight="bold" color="text.secondary">
                No notifications yet
              </Typography>
              <Typography variant="caption" color="text.secondary">
                When you have notifications, they will appear here.
              </Typography>
            </Box>
          ) : (
            notifications.map((notif) => (
              <MenuItem 
                key={notif.id} 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'flex-start', 
                  gap: 2, 
                  p: 2,
                  whiteSpace: 'normal',
                  borderBottom: '1px solid #f4f5f7',
                  bgcolor: notif.isRead ? 'white' : '#e6fcff',
                  transition: 'background-color 0.2s',
                  '&:hover': { 
                    bgcolor: notif.isRead ? '#f4f5f7' : '#d5f5fa' 
                  }
                }}
                onClick={() => handleMarkAsRead(notif)}
              >
                {/* Avatar */}
                <Box sx={{ position: 'relative' }}>
                  <Avatar 
                    src={notif.sender?.avatarUrl} 
                    alt="sender" 
                    sx={{ width: 40, height: 40, border: '1px solid #dfe1e6' }} 
                  />
                </Box>
                
                {/* Content */}
                <Box sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontWeight: notif.isRead ? 400 : 700, 
                        color: '#172b4d', 
                        lineHeight: 1.4 
                      }}
                    >
                      {/* Hiển thị content từ backend */}
                      {notif.content}
                    </Typography>
                    
                    {/* Chấm xanh chưa đọc */}
                    {!notif.isRead && (
                      <FiberManualRecordIcon 
                        sx={{ fontSize: '12px', color: '#0079bf', ml: 1, mt: 0.5 }} 
                      />
                    )}
                  </Box>
                  
                  <Typography variant="caption" sx={{ color: '#5e6c84', display: 'block' }}>
                    {moment(notif.createdAt).fromNow()}
                  </Typography>
                </Box>
              </MenuItem>
            ))
          )}
        </Box>
        
        {/* FOOTER */}
        {notifications.length > 0 && (
          <Box sx={{ p: 1, borderTop: '1px solid #ebecf0', textAlign: 'center', bgcolor: '#f9fafc' }}>
            <Button size="small" sx={{ textTransform: 'none', color: '#5e6c84' }}>
              View all notifications
            </Button>
          </Box>
        )}
      </Menu>
    </Box>
  )
}

export default Notifications