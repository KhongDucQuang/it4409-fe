// src/pages/Boards/index.jsx
import { useState, useEffect } from 'react'
import { Container, Box, Typography, Grid, Card, CardContent, CardActionArea, Pagination, Stack } from '@mui/material'
import AppBar from '~/components/AppBar/AppBar'
import { fetchBoardsAPI } from '~/apis/boardApi'
import { useNavigate } from 'react-router-dom'
import CreateBoardModal from '~/components/Modal/CreateBoardModal/CreateBoardModal'
import AddIcon from '@mui/icons-material/Add'
import DashboardIcon from '@mui/icons-material/Dashboard'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'

function Boards() {
  const [boards, setBoards] = useState([])
  const [metadata, setMetadata] = useState(null)
  const navigate = useNavigate()
  const [searchValue, setSearchValue] = useState('')
  // State quản lý modal tạo board
  const [openCreateModal, setOpenCreateModal] = useState(false)

  useEffect(() => {
    // Giữ nguyên logic gọi API của bạn
    fetchBoardsAPI('?page=1&limit=12').then(res => {
      setBoards(res.data)
      setMetadata(res.metadata)
    })
  }, [])

  if (!boards) return <div>Loading...</div>

  return (
    <Container disableGutters maxWidth={false} sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* 1. APP BAR */}
      <AppBar 
        searchValue={searchValue}
        setSearchValue={setSearchValue}
      />
      
      {/* 2. MAIN CONTENT WRAPPER (Có hình nền) */}
      <Box sx={{
        flexGrow: 1,
        paddingTop: '20px',
        paddingBottom: '20px',
        // Hình nền giống trang Login/Board Detail
        backgroundImage: 'url("https://images.unsplash.com/photo-1627389955611-705a6f8bb75d?q=80&w=2070&auto=format&fit=crop")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        overflowY: 'auto' // Cho phép cuộn nếu danh sách dài
      }}>
        
        <Container maxWidth="lg">
          <Typography 
            variant="h5" 
            sx={{ 
              mb: 3, 
              fontWeight: 'bold', 
              color: 'grey',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              textShadow: '0 2px 4px rgba(0,0,0,0.4)' // Bóng chữ cho dễ đọc trên nền ảnh
            }}
          >
            <DashboardIcon /> Your Boards
          </Typography>

          <Grid container spacing={3}>
            
            {/* 3. NÚT TẠO BOARD MỚI (Đặt lên đầu tiên cho tiện) */}
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                height: '140px', 
                backgroundColor: 'rgba(255, 255, 255, 0.4)', // Trong suốt hơn
                backdropFilter: 'blur(4px)',
                border: '1px dashed white', // Viền nét đứt
                borderRadius: '12px',
                transition: 'all 0.2s ease',
                '&:hover': { 
                   backgroundColor: 'rgba(255, 255, 255, 0.6)',
                   cursor: 'pointer',
                   transform: 'translateY(-4px)'
                }
              }}>
                <CardActionArea 
                  sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}
                  onClick={() => setOpenCreateModal(true)}
                >
                  <AddIcon sx={{ fontSize: 40, color: 'black', mb: 1 }} />
                  <Typography variant="h6" sx={{ color: 'black', fontWeight: 'bold' }}>
                    Create new board
                  </Typography>
                </CardActionArea>
              </Card>
            </Grid>

            {/* 4. DANH SÁCH BOARDS */}
            {boards.map(board => (
              <Grid item xs={12} sm={6} md={3} key={board.id}>
                <Card sx={{ 
                  height: '140px', 
                  // Hiệu ứng kính mờ (Glassmorphism)
                  backgroundColor: 'rgba(255, 255, 255, 0.85)', 
                  backdropFilter: 'blur(8px)',
                  borderRadius: '12px',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                  transition: 'all 0.2s ease',
                  '&:hover': { 
                    transform: 'translateY(-4px)',
                    boxShadow: '0 10px 15px rgba(0,0,0,0.2)',
                    backgroundColor: 'white' // Sáng lên khi hover
                  }
                }}>
                  <CardActionArea 
                    sx={{ height: '100%', p: 2, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'space-between' }}
                    onClick={() => navigate(`/boards/${board.id}`)}
                  >
                    <CardContent sx={{ p: 0, width: '100%' }}>
                      <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', color: '#172b4d', lineHeight: 1.3 }}>
                        {board.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                        {board.description || 'No description'} 
                      </Typography>
                    </CardContent>
                    
                    <Box sx={{ width: '100%', display: 'flex', justifyContent: 'flex-end' }}>
                       <ArrowForwardIcon fontSize="small" sx={{ color: '#172b4d' }}/>
                    </Box>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* 5. PHÂN TRANG */}
          {metadata && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5, mb: 3 }}>
              <Pagination 
                count={metadata.totalPages} 
                color="primary" 
                size="large"
                sx={{
                  '& .MuiPaginationItem-root': {
                    color: 'white', // Chữ màu trắng
                    fontWeight: 'bold',
                    backgroundColor: 'rgba(0,0,0,0.3)', // Nền nút mờ
                    backdropFilter: 'blur(4px)',
                    '&:hover': { backgroundColor: 'rgba(0,0,0,0.5)' },
                    '&.Mui-selected': { backgroundColor: '#1976d2' }
                  }
                }}
              />
            </Box>
          )}

          {/* Modal Tạo Board */}
          <CreateBoardModal 
            isOpen={openCreateModal}
            onClose={() => setOpenCreateModal(false)}
          />
        </Container>
      </Box>
    </Container>
  )
}

export default Boards