// src/components/GlobalNotificationListener.jsx
import { useEffect } from 'react'
import { socket } from '~/socket'
import { toast } from 'react-toastify'
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive'

/**
 * Component này chỉ làm 1 việc: Lắng nghe socket và hiển thị toast
 * Không render gì cả, chỉ để xử lý side effects
 */
function GlobalNotificationListener() {
  useEffect(() => {
    console.log('🎧 Global notification listener mounted')

    const handleNewNotification = (data) => {
      console.log('🔔 [GLOBAL] Received notification:', data)
      
      const notification = data.notification
      if (!notification) return

      // Hiển thị toast với icon và styling đẹp
      toast.info(
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
          <NotificationsActiveIcon sx={{ color: '#0079bf', mt: 0.5 }} />
          <div>
            <div style={{ fontWeight: 600, marginBottom: '4px', color: '#172b4d' }}>
              Thông báo mới
            </div>
            <div style={{ fontSize: '14px', color: '#5e6c84' }}>
              {notification.content}
            </div>
          </div>
        </div>,
        {
          position: 'top-right',
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          style: {
            borderLeft: '4px solid #0079bf'
          }
        }
      )

      // Optional: Phát âm thanh thông báo
      // playNotificationSound()
    }

    // Đăng ký listener
    socket.on('BE_NEW_NOTIFICATION', handleNewNotification)

    // Cleanup
    return () => {
      console.log('🔇 Global notification listener unmounted')
      socket.off('BE_NEW_NOTIFICATION', handleNewNotification)
    }
  }, [])

  // Component này không render gì cả
  return null
}

export default GlobalNotificationListener