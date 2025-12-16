import { useState, useEffect, useRef } from 'react'
import { Modal, Box, Typography, Grid, Stack, Button, TextField, Avatar, AvatarGroup, Popover, List, ListItem, ListItemButton, ListItemAvatar, ListItemText, Checkbox, Divider } from '@mui/material'
import CreditCardIcon from '@mui/icons-material/CreditCard'
import SubjectIcon from '@mui/icons-material/Subject'
import CloseIcon from '@mui/icons-material/Close'
import TaskAltIcon from '@mui/icons-material/TaskAlt'
import LocalOfferIcon from '@mui/icons-material/LocalOffer'
import GroupIcon from '@mui/icons-material/Group'
import CommentIcon from '@mui/icons-material/Comment'
import DescriptionIcon from '@mui/icons-material/Description'
import AttachmentIcon from '@mui/icons-material/Attachment'
import DeleteIcon from '@mui/icons-material/Delete' // Import nút xóa
import { useConfirm } from 'material-ui-confirm' // <--- THÊM DÒNG NÀY
import { updateCardDetailsAPI, createNewCommentAPI, assignMemberAPI, unassignMemberAPI, createAttachmentAPI, deleteCardAPI } from '~/apis/cardApi'
import { API_ROOT } from '~/utils/constants'
import { toast } from 'react-toastify'
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import { 
  createChecklistAPI, deleteChecklistAPI, 
  createChecklistItemAPI, updateChecklistItemAPI, deleteChecklistItemAPI 
} from '~/apis/cardApi';
import LinearProgress from '@mui/material/LinearProgress'; // Thanh tiến độ
import { socket } from '~/socket'
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import { toggleLabelAPI } from '~/apis' // Import hàm vừa viết

const LABEL_COLORS = [
  '#61bd4f', '#f2d600', '#ff9f1a', '#eb5a46', '#c377e0', '#0079bf'
]

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 900,
  maxHeight: '90vh',
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  borderRadius: '8px',
  outline: 'none',
  overflowY: 'auto'
}

function ActiveCardModal({ activeCard, setActiveCard, isOpen, onClose, boardMembers }) {
  const [comment, setComment] = useState('')
  const [description, setDescription] = useState(activeCard?.description || '')
  const [checklistIdOpenForm, setChecklistIdOpenForm] = useState(null) // Lưu ID của checklist đang mở form
  const [newItemContent, setNewItemContent] = useState('')
  // State cho Popover Members
  const [anchorElMembers, setAnchorElMembers] = useState(null)
  const openMembers = Boolean(anchorElMembers)
  const [forceUpdate, setForceUpdate] = useState(false)
  const confirm = useConfirm()
  const [title, setTitle] = useState(activeCard?.title || '')
  useEffect(() => {
      // Dùng optional chaining (?.) và OR (||) để tránh lỗi null
      setTitle(activeCard?.title || '')
      setDescription(activeCard?.description || '')
  }, [activeCard])
  const fileInputRef = useRef(null)
  const [anchorElLabel, setAnchorElLabel] = useState(null)

  if (!activeCard) return null

  // --- XỬ LÝ COMMENT ---
  const handleAddComment = async () => {
    if (!comment) return
    try {
      const newComment = await createNewCommentAPI(activeCard._id, { content: comment })
      if (!activeCard.comments) activeCard.comments = []
      activeCard.comments.unshift(newComment)
      setComment('')
      
      // ✅ CHỈ BẮN KHI THÀNH CÔNG
      socket.emit('FE_UPDATE_BOARD', { boardId: activeCard.boardId });
    } catch (error) {
      toast.error('Gửi bình luận thất bại')
    }
  }

  const handleUpdateTitle = async () => {
    if (title === activeCard.title) return
    try {
      await updateCardDetailsAPI(activeCard._id, { title })
      activeCard.title = title 
      toast.success('Đổi tên thẻ thành công!')
      
      // 👇 CHÈN VÀO ĐÂY
      socket.emit('FE_UPDATE_BOARD', { boardId: activeCard.boardId })

    } catch (error) {
      toast.error('Lỗi đổi tên thẻ')
    }
  }

  const handleUpdateDescription = async () => {
    if (description === activeCard.description) return
    try {
      await updateCardDetailsAPI(activeCard._id, { description })
      toast.success('Cập nhật mô tả thành công!')
      
      // 👇 CHÈN VÀO ĐÂY
      socket.emit('FE_UPDATE_BOARD', { boardId: activeCard.boardId })

    } catch (error) {
      toast.error('Lỗi cập nhật mô tả')
    }
  }

  // --- XỬ LÝ ASSIGN MEMBERS ---
  const handleMemberClick = (event) => setAnchorElMembers(event.currentTarget)
  const handleCloseMembers = () => setAnchorElMembers(null)

  const handleToggleMember = async (userId) => {
    try {
      const isAssigned = activeCard.assignees?.some(a => a.userId === userId)

      if (isAssigned) {
        // Hủy gán
        await unassignMemberAPI(activeCard._id, userId)
        activeCard.assignees = activeCard.assignees.filter(a => a.userId !== userId)
        toast.info('Đã hủy gán thành viên')
        
        // ✅ Bắn socket update board (mất avatar)
        socket.emit('FE_UPDATE_BOARD', { boardId: activeCard.boardId })

      } else {
        // Gán thành viên
        await assignMemberAPI(activeCard._id, userId)
        
        const userToAdd = boardMembers.find(m => m.user.id === userId)?.user
        if (userToAdd) {
            if (!activeCard.assignees) activeCard.assignees = []
            activeCard.assignees.push({ userId: userToAdd.id, user: userToAdd })
        }
        toast.success('Đã gán thành viên thành công')

        // ✅ Socket 1: Update board (hiện avatar)
        socket.emit('FE_UPDATE_BOARD', { boardId: activeCard.boardId })

        // ✅ Socket 2: Thông báo riêng
        socket.emit('FE_SEND_NOTIFICATION', { 
            recipientId: userId, 
            boardId: activeCard.boardId 
        })
      }
      setComment(prev => prev) 

    } catch (error) {
      toast.error('Lỗi cập nhật thành viên')
    }
  }

  // 3. Hàm xử lý logic Toggle
  const handleToggleLabel = async (color) => {
    try {
      // Gọi API
      const updatedCard = await toggleLabelAPI({
        cardId: activeCard._id,
        boardId: activeCard.boardId,
        color: color,
        name: '' // Tên label để trống (hoặc sau này làm tính năng sửa tên)
      })

      // Cập nhật State (Quan trọng: Backend trả về cấu trúc lồng nhau)
      // updatedCard.labels là mảng các object LabelsOnCards
      setActiveCard(prev => ({
        ...prev,
        labels: updatedCard.labels 
      }))

      // Bắn Socket
      socket.emit('FE_UPDATE_BOARD', { boardId: activeCard.boardId })

    } catch (error) {
      console.error('Lỗi toggle label:', error)
      toast.error('Lỗi cập nhật nhãn')
    }
  }

  // 4. Các hàm mở/đóng Popover đơn giản
  const handleLabelClick = (event) => setAnchorElLabel(event.currentTarget)
  const handleCloseLabel = () => setAnchorElLabel(null)

  // --- XỬ LÝ ATTACHMENT ---
  const handleUploadAttachment = async (event) => {
    const file = event.target.files[0]
    if (!file) return
    try {
      const newAttachment = await createAttachmentAPI(activeCard._id, file)
      setActiveCard(prev => ({
        ...prev,
        attachments: [newAttachment, ...(prev.attachments || [])]
      }))
      toast.success('Upload file thành công!')
      event.target.value = ''
      
      // ✅
      socket.emit('FE_UPDATE_BOARD', { boardId: activeCard.boardId });
    } catch (error) {
      toast.error('Lỗi upload file')
    }
  }

  // --- XỬ LÝ XÓA THẺ (DELETE CARD) ---
  const handleDeleteCard = () => {
    confirm({
      title: 'Xóa thẻ?',
      description: `Bạn có chắc chắn muốn xóa vĩnh viễn thẻ "${activeCard?.title}" không? Hành động này không thể hoàn tác!`,
      confirmationText: 'Xác nhận',
      cancellationText: 'Hủy',
    })
      .then(async () => {
        try {
          await deleteCardAPI(activeCard._id)
          toast.success('Đã xóa thẻ thành công')
          
          // ✅ Bắn socket trước khi đóng modal
          socket.emit('FE_UPDATE_BOARD', { boardId: activeCard.boardId });

          onClose() 
          // Không reload trang nữa vì socket ở _id.jsx sẽ lo việc này
        } catch (error) {
          toast.error('Lỗi xóa thẻ')
        }
      })
      .catch(() => {})
  }

  // --- XỬ LÝ CHECKLIST ---
  const handleAddChecklist = async () => {
    try {
      // 1. Gọi API tạo mới
      const newChecklist = await createChecklistAPI(activeCard._id, 'To do');
      
      // 2. Cập nhật dữ liệu Local cho User A thấy ngay
      if (!activeCard.checklists) activeCard.checklists = [];
      activeCard.checklists.push({ ...newChecklist, items: [] });
      
      // 👇 QUAN TRỌNG: Ép giao diện vẽ lại ngay lập tức
      setForceUpdate(prev => !prev); 

      // 3. Bắn socket cho User B
      socket.emit('FE_UPDATE_BOARD', { boardId: activeCard.boardId });

    } catch (error) {
      toast.error('Lỗi tạo checklist');
    }
  };

  const handleDeleteChecklist = async (checklistId) => {
    try {
      // 1. Gọi API xóa
      await deleteChecklistAPI(checklistId);
      
      // 2. Cập nhật dữ liệu Local (Lọc bỏ cái vừa xóa)
      // Lưu ý: Kiểm tra kỹ xem backend trả về là "id" hay "_id". Thường là "id" nếu bạn đã map, hoặc "_id" nếu là raw Mongo.
      // Ở đây mình dùng logic an toàn: activeCard.checklists đang hiển thị cái gì thì lọc theo cái đó.
      activeCard.checklists = activeCard.checklists.filter(c => c.id !== checklistId && c._id !== checklistId);
      
      // 👇 QUAN TRỌNG: Ép giao diện vẽ lại ngay lập tức
      setForceUpdate(prev => !prev);

      // 3. Bắn socket cho User B
      socket.emit('FE_UPDATE_BOARD', { boardId: activeCard.boardId });
    } catch (error) {
      toast.error('Lỗi xóa checklist');
    }
  };
  // --- XỬ LÝ CHECKLIST ITEMS ---
  
  // 1. Hàm gọi API thêm item (Logic gốc)
  const handleAddItem = async (checklistId, content) => {
    try {
      const newItem = await createChecklistItemAPI(checklistId, content);
      const checklist = activeCard.checklists.find(c => c.id === checklistId);
      if (checklist) {
          if (!checklist.items) checklist.items = [];
          checklist.items.push(newItem);
      }
      setComment(prev => prev);
      
      // ✅
      socket.emit('FE_UPDATE_BOARD', { boardId: activeCard.boardId });
    } catch (error) {
       toast.error('Lỗi thêm việc');
    }
  };

  // 2. Hàm xử lý sự kiện Submit Form (Dùng cho cả nút Thêm và phím Enter)
  const handleAddItemSubmit = async (checklistId) => {
    if (!newItemContent.trim()) return;
    await handleAddItem(checklistId, newItemContent);
    setNewItemContent(''); 
    // Không cần emit ở đây vì hàm handleAddItem đã emit rồi
  };

  // 3. Hàm tick chọn (Đã sửa Optimistic UI - Cập nhật ngay)
  // 3. Hàm tick chọn (Đã sửa lỗi không cập nhật ngay)
  const handleToggleItem = async (itemId, currentStatus) => {
    // Optimistic UI
    const newStatus = !currentStatus;
    activeCard.checklists.forEach(list => {
      const item = list.items.find(i => i.id === itemId);
      if (item) item.isCompleted = newStatus;
    });
    setForceUpdate(prev => !prev); 

    try {
      await updateChecklistItemAPI(itemId, { isCompleted: newStatus });
      
      // ✅
      socket.emit('FE_UPDATE_BOARD', { boardId: activeCard.boardId });
    } catch (error) {
       toast.error('Lỗi cập nhật trạng thái');
       // Rollback
       activeCard.checklists.forEach(list => {
        const item = list.items.find(i => i.id === itemId);
        if (item) item.isCompleted = currentStatus;
      });
      setForceUpdate(prev => !prev);
    }
  };
  
  const handleDeleteItem = async (itemId) => {
     // 1. Optimistic UI: Xóa trên giao diện NGAY LẬP TỨC
     // Sử dụng map để tạo mảng mới thay vì sửa trực tiếp, giúp React nhận biết thay đổi
     const newChecklists = activeCard.checklists.map(list => {
       if (list.items) {
         return {
           ...list,
           items: list.items.filter(i => i.id !== itemId)
         }
       }
       return list;
     });
     
     activeCard.checklists = newChecklists; // Gán lại mảng mới
     setForceUpdate(prev => !prev); // Ép vẽ lại

     // 2. Gọi API xóa ngầm bên dưới
     try {
       await deleteChecklistItemAPI(itemId);
       
       // 3. Bắn socket cho User B cập nhật
       socket.emit('FE_UPDATE_BOARD', { boardId: activeCard.boardId });
     } catch (error) {
        toast.error('Lỗi xóa việc');
     }
  }

  // Style cho Modal chính (Bạn có thể đặt cái này ở ngoài component hoặc trong file này đều được)
  const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 900, // Rộng hơn một chút cho thoáng
    maxWidth: '95vw',
    maxHeight: '90vh',
    bgcolor: '#ffffff', // Nền trắng tuyệt đối
    boxShadow: 24,
    borderRadius: '12px', // Bo góc mềm mại
    outline: 'none',
    overflowY: 'auto', // Scroll nội dung nếu dài
    p: 0 // Padding xử lý bên trong
  }

  // --- PHẦN RETURN ---
  return (
    <Modal 
      open={isOpen} 
      onClose={onClose}
      sx={{
        '& .MuiBackdrop-root': {
            backgroundColor: 'rgba(0, 0, 0, 0.5)', // Làm tối nền sau
            backdropFilter: 'blur(4px)' // Làm mờ nền sau (hiệu ứng kính)
        }
      }}
    >
      <Box sx={modalStyle}>
        
        {/* --- 1. HEADER VÙNG TIÊU ĐỀ --- */}
        <Box sx={{ 
            p: 3, 
            pb: 1, 
            position: 'sticky', 
            top: 0, 
            bgcolor: 'white', 
            zIndex: 10,
            borderBottom: '1px solid #e0e0e0' // Gạch ngang nhẹ ngăn cách header
        }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            {/* Title Input */}
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, width: '90%' }}>
              <CreditCardIcon sx={{ color: '#172b4d', mt: 0.5 }} />
              <Box sx={{ width: '100%' }}>
                  <TextField
                    fullWidth
                    multiline // Cho phép tiêu đề dài xuống dòng
                    variant="standard"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onBlur={handleUpdateTitle}
                    InputProps={{
                        disableUnderline: true,
                        style: { fontSize: '1.25rem', fontWeight: 'bold', color: '#172b4d' }
                    }}
                    sx={{
                        '& .MuiInputBase-input': {
                            p: 0.5,
                            borderRadius: 1,
                            transition: 'all 0.2s',
                            border: '2px solid transparent',
                            '&:focus': { bgcolor: 'white', borderColor: '#1976d2' } // Focus có viền xanh
                        }
                    }}
                  />
                  {/* <Typography variant="caption" sx={{ color: 'text.secondary', ml: 0.5 }}>
                    in list <Typography component="span" variant="caption" fontWeight="bold">Checklist</Typography>
                  </Typography> */}
              </Box>
            </Box>

            {/* Close Button */}
            <Box 
                onClick={onClose}
                sx={{ 
                    cursor: 'pointer', 
                    color: '#5e6c84', 
                    p: 1, 
                    borderRadius: '50%',
                    '&:hover': { bgcolor: '#091e420a', color: '#172b4d' } 
                }}
            >
                <CloseIcon />
            </Box>
          </Box>
        </Box>

        {/* --- 2. BODY CONTENT --- */}
        <Grid container spacing={0} sx={{ p: 3 }}>
          
          {/* === CỘT TRÁI (NỘI DUNG CHÍNH) === */}
          <Grid item xs={12} md={9} sx={{ pr: { md: 3 } }}>
            
            {/* Members Section */}
            {activeCard?.assignees?.length > 0 && (
              <Box sx={{ mb: 4, ml: 4 }}>
                  <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ display: 'block', mb: 1, textTransform: 'uppercase', fontSize: '11px' }}>Members</Typography>
                  <AvatarGroup max={4} sx={{ justifyContent: 'flex-start', '& .MuiAvatar-root': { width: 32, height: 32, border: 'none' } }}>
                    {activeCard.assignees.map((assignee, index) => (
                      <Avatar key={index} alt={assignee.user?.name} src={assignee.user?.avatarUrl} />
                    ))}
                  </AvatarGroup>
              </Box>
            )}

            {/* 👇👇👇 CHÈN VỊ TRÍ 1 VÀO ĐÂY (NGAY DƯỚI TITLE) 👇👇👇 */}
            <div style={{ display: 'flex', gap: '8px', margin: '10px 0 20px 0', flexWrap: 'wrap' }}>
              {activeCard?.labels?.map((item) => {
                const labelData = item.label 
                if (!labelData) return null

                return (
                  <div
                    key={labelData.id}
                    style={{
                      backgroundColor: labelData.color,
                      width: '40px',
                      height: '32px',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                    title={labelData.name}
                  />
                )
              })}
            </div>
            {/* 👆👆👆 KẾT THÚC VỊ TRÍ 1 👆👆👆 */}

            {/* Description Section */}
            <Box sx={{ mb: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <SubjectIcon sx={{ color: '#172b4d' }} />
                <Typography variant="h6" fontSize="1rem" fontWeight="bold" sx={{ color: '#172b4d' }}>Description</Typography>
              </Box>
              
              <Box sx={{ ml: 4 }}>
                  <TextField
                    fullWidth multiline minRows={3}
                    placeholder="Add a more detailed description..."
                    variant="outlined"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    onBlur={handleUpdateDescription}
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            bgcolor: '#f4f5f7', // Nền xám nhẹ
                            '& fieldset': { border: 'none' }, // Bỏ viền đen
                            '&:hover fieldset': { border: 'none' },
                            '&.Mui-focused': { bgcolor: 'white', boxShadow: 'inset 0 0 0 2px #1976d2' } // Focus nền trắng + viền xanh
                        }
                    }}
                  />
              </Box>
            </Box>

            {/* Attachments Section */}
            {activeCard?.attachments?.length > 0 && (
              <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                  <AttachmentIcon sx={{ color: '#172b4d' }} />
                  <Typography variant="h6" fontSize="1rem" fontWeight="bold" sx={{ color: '#172b4d' }}>Attachments</Typography>
                </Box>
                <Stack spacing={2} sx={{ ml: 4 }}>
                  {activeCard.attachments.map((att) => (
                    <Box key={att.id} sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, '&:hover': { bgcolor: '#f4f5f7' }, p: 1, borderRadius: 1, cursor: 'pointer' }}>
                      {/* Thumbnail */}
                      <Box sx={{ 
                          width: 80, height: 60, borderRadius: 1, overflow: 'hidden', 
                          bgcolor: '#e9e9e9', display: 'flex', alignItems: 'center', justifyContent: 'center' 
                      }}>
                          {att.mimeType.includes('image') 
                            ? <img src={`${API_ROOT}/${att.url}`} alt="att" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            : <InsertDriveFileIcon sx={{ color: '#5e6c84', fontSize: 30 }} />
                          }
                      </Box>
                      {/* Info */}
                      <Box>
                        <Typography variant="subtitle2" fontWeight="bold" sx={{ color: '#172b4d' }}>{att.fileName}</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="caption" color="text.secondary">{new Date(att.uploadedAt).toLocaleDateString()}</Typography>
                            <Typography variant="caption" color="text.secondary">•</Typography>
                            <a href={`${API_ROOT}/${att.url}`} target="_blank" rel="noreferrer" 
                               style={{ fontSize: '12px', fontWeight: 'bold', textDecoration: 'none', color: '#172b4d', borderBottom: '1px solid #172b4d' }}
                            >
                                Download
                            </a>
                        </Box>
                      </Box>
                    </Box>
                  ))}
                </Stack>
              </Box>
            )}

            {/* Checklists Section */}
            {activeCard?.checklists?.length > 0 && activeCard.checklists.map(checklist => {
              const totalItems = checklist.items?.length || 0
              const completedItems = checklist.items?.filter(i => i.isCompleted)?.length || 0
              const progress = totalItems === 0 ? 0 : (completedItems / totalItems) * 100

              return (
                <Box key={checklist.id} sx={{ mb: 4 }}>
                  {/* Checklist Header */}
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <TaskAltIcon sx={{ color: '#172b4d' }} />
                      <Typography variant="h6" fontSize="1rem" fontWeight="bold" sx={{ color: '#172b4d' }}>
                        {checklist.title}
                      </Typography>
                    </Box>
                    <Button 
                        size="small" 
                        sx={{ bgcolor: '#091e420a', color: '#172b4d', fontWeight: 'bold', '&:hover': { bgcolor: '#dfe1e6' } }}
                        onClick={() => handleDeleteChecklist(checklist.id)}
                    >
                        Delete
                    </Button>
                  </Box>

                  {/* Progress Bar */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, ml: 4 }}>
                    <Typography variant="caption" sx={{ minWidth: 30, color: 'text.secondary', fontWeight: 'bold' }}>{Math.round(progress)}%</Typography>
                    <LinearProgress 
                        variant="determinate" 
                        value={progress} 
                        sx={{ 
                            width: '100%', borderRadius: 4, height: 8, 
                            bgcolor: '#091e420a',
                            '& .MuiLinearProgress-bar': { bgcolor: progress === 100 ? '#4bce97' : '#579dff' } // Xanh lá khi xong 100%
                        }} 
                    />
                  </Box>

                  {/* Checklist Items */}
                  <Stack spacing={1} sx={{ mb: 2, ml: 4 }}>
                    {checklist.items?.map(item => (
                      <Box key={item.id} sx={{ 
                          display: 'flex', alignItems: 'center', gap: 1, 
                          '&:hover .delete-icon': { opacity: 1 } // Hiện nút xoá khi hover
                      }}>
                        <Checkbox 
                          checked={item.isCompleted} 
                          onChange={() => handleToggleItem(item.id, item.isCompleted)}
                          sx={{ p: 0.5, '&.Mui-checked': { color: '#4bce97' } }}
                        />
                        <TextField
                          fullWidth variant="standard" value={item.content}
                          InputProps={{ disableUnderline: true, readOnly: true }}
                          sx={{ 
                             textDecoration: item.isCompleted ? 'line-through' : 'none',
                             color: item.isCompleted ? 'text.secondary' : 'text.primary',
                             '& .MuiInputBase-input': { fontSize: '0.95rem' }
                          }}
                        />
                         <Box className="delete-icon" sx={{ opacity: 0, transition: 'opacity 0.2s' }}>
                            <CloseIcon 
                                fontSize="small" 
                                sx={{ cursor: 'pointer', color: '#5e6c84', '&:hover': { color: '#cf3e3e' } }} 
                                onClick={() => handleDeleteItem(item.id)} 
                            />
                         </Box>
                      </Box>
                    ))}
                  </Stack>

                  {/* Add New Item Form */}
                  <Box sx={{ ml: 4 }}>
                    {checklistIdOpenForm !== checklist.id ? (
                      <Button 
                        variant="contained" size="small"
                        sx={{ bgcolor: '#091e420a', color: '#172b4d', boxShadow: 'none', fontWeight: 'bold', '&:hover': { bgcolor: '#091e4214', boxShadow: 'none' } }}
                        onClick={() => setChecklistIdOpenForm(checklist.id)}
                      >
                        Add an item
                      </Button>
                    ) : (
                      <Box sx={{ animation: 'fadeIn 0.2s' }}>
                        <TextField
                          fullWidth autoFocus multiline placeholder="Add an item..."
                          value={newItemContent}
                          onChange={(e) => setNewItemContent(e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAddItemSubmit(checklist.id) }}}
                          sx={{ 
                            '& .MuiOutlinedInput-root': { bgcolor: 'white', '& fieldset': { borderColor: '#1976d2' } },
                            mb: 1
                          }}
                        />
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Button variant="contained" onClick={() => handleAddItemSubmit(checklist.id)}>Add</Button>
                          <Button variant="text" size="small" sx={{ color: '#172b4d' }} onClick={() => { setChecklistIdOpenForm(null); setNewItemContent('') }}>Cancel</Button>
                        </Box>
                      </Box>
                    )}
                  </Box>
                </Box>
              )
            })}

            {/* Activity / Comments Section */}
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <DescriptionIcon sx={{ color: '#172b4d' }} />
                <Typography variant="h6" fontSize="1rem" fontWeight="bold" sx={{ color: '#172b4d' }}>Activity</Typography>
              </Box>
              
              <Box sx={{ ml: 4 }}>
                {/* Input Comment */}
                <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                    <Avatar sx={{ width: 32, height: 32, bgcolor: '#dfe1e6', color: '#172b4d', fontSize: '14px' }}>Me</Avatar>
                    <Box sx={{ width: '100%' }}>
                    <TextField 
                        fullWidth placeholder="Write a comment..." size="small" 
                        value={comment} onChange={(e) => setComment(e.target.value)} 
                        sx={{ 
                            mb: 1,
                            '& .MuiOutlinedInput-root': { bgcolor: 'white', '&.Mui-focused fieldset': { borderColor: '#1976d2' } }
                        }} 
                    />
                    <Button variant="contained" size="small" disabled={!comment} onClick={handleAddComment} sx={{ textTransform: 'none' }}>Save</Button>
                    </Box>
                </Box>

                {/* List Comments */}
                <Stack spacing={2}>
                    {activeCard?.comments?.map((comment) => (
                        <Box key={comment.id} sx={{ display: 'flex', gap: 2 }}>
                        <Avatar alt={comment.user?.name} src={comment.user?.avatarUrl} sx={{ width: 32, height: 32 }} />
                        <Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="subtitle2" fontWeight="bold" sx={{ color: '#172b4d' }}>{comment.user?.name}</Typography>
                                <Typography variant="caption" color="text.secondary">{new Date(comment.createdAt).toLocaleString()}</Typography>
                            </Box>
                            <Box sx={{ p: 1.5, bgcolor: 'white', border: '1px solid #dfe1e6', borderRadius: 2, mt: 0.5, boxShadow: '0 1px 2px rgba(9, 30, 66, 0.08)' }}>
                                <Typography variant="body2" color="#172b4d">{comment.content}</Typography>
                            </Box>
                        </Box>
                        </Box>
                    ))}
                </Stack>
              </Box>
            </Box>
          </Grid>

          {/* === CỘT PHẢI (SIDEBAR ACTIONS) === */}
          <Grid item xs={12} md={3} sx={{ mt: { xs: 4, md: 0 } }}>
            <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ mb: 1.5, display: 'block', textTransform: 'uppercase', fontSize: '11px' }}>Add to card</Typography>
            
            <Stack direction="column" spacing={1}>
              {/* Member Button */}
              <Button 
                variant="contained" 
                startIcon={<GroupIcon />} 
                onClick={handleMemberClick} 
                sx={{ 
                    justifyContent: 'flex-start', 
                    bgcolor: '#091e420a', color: '#172b4d', boxShadow: 'none', fontWeight: 'bold', 
                    '&:hover': { bgcolor: '#091e4214', boxShadow: 'none' } 
                }}
              >
                Members
              </Button>
              <Popover open={openMembers} anchorEl={anchorElMembers} onClose={handleCloseMembers} anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}>
                <Box sx={{ p: 2, width: 280 }}>
                  <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1, textAlign: 'center' }}>Assign members</Typography>
                  <Divider sx={{ mb: 1 }}/>
                  <List dense>
                    {boardMembers?.map(member => {
                      const isAssigned = activeCard.assignees?.some(a => a.userId === member.user.id)
                      return (
                        <ListItem key={member.id} disablePadding>
                          <ListItemButton onClick={() => handleToggleMember(member.user.id)} sx={{ borderRadius: 1 }}>
                            <ListItemAvatar><Avatar alt={member.user.name} src={member.user.avatarUrl} sx={{ width: 28, height: 28 }} /></ListItemAvatar>
                            <ListItemText primary={member.user.name} />
                            <Checkbox edge="end" checked={!!isAssigned} />
                          </ListItemButton>
                        </ListItem>
                      )
                    })}
                  </List>
                </Box>
              </Popover>

              {/* Other Actions Buttons */}
              {/* --- LABELS BUTTON & POPOVER --- */}
              <Button 
                  variant="contained" 
                  startIcon={<LocalOfferIcon />} 
                  onClick={handleLabelClick} // 👈 1. Thêm sự kiện Click mở Popover
                  sx={{ 
                      justifyContent: 'flex-start', 
                      bgcolor: '#091e420a', 
                      color: '#172b4d', 
                      boxShadow: 'none', 
                      fontWeight: 'bold', 
                      '&:hover': { bgcolor: '#091e4214', boxShadow: 'none' } 
                  }}
              >
                  Labels
              </Button>

              {/* 👇 2. THÊM POPOVER CHỌN MÀU Ở ĐÂY 👇 */}
              <Popover
                  open={Boolean(anchorElLabel)}
                  anchorEl={anchorElLabel}
                  onClose={handleCloseLabel}
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
              >
                  <Box sx={{ p: 2, width: 250 }}>
                      <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>Labels</Typography>
                      
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {LABEL_COLORS.map((color) => {
                              // Kiểm tra xem card đã có màu này chưa (structure: labels -> label -> color)
                              const isActive = activeCard?.labels?.some(item => item.label?.color === color)

                              return (
                                  <Box
                                      key={color}
                                      onClick={() => handleToggleLabel(color)}
                                      sx={{
                                          width: '100%',
                                          height: '32px',
                                          bgcolor: color,
                                          borderRadius: 1,
                                          cursor: 'pointer',
                                          position: 'relative',
                                          transition: 'opacity 0.2s',
                                          '&:hover': { opacity: 0.8 }
                                      }}
                                  >
                                      {isActive && (
                                          <Box 
                                              component="span" 
                                              sx={{ 
                                                  position: 'absolute', 
                                                  right: 8, 
                                                  top: 6, 
                                                  color: 'white', 
                                                  fontWeight: 'bold',
                                                  fontSize: '14px'
                                              }}
                                          >
                                              ✓
                                          </Box>
                                      )}
                                  </Box>
                              )
                          })}
                      </Box>
                  </Box>
              </Popover>
              {/* --- END LABELS SECTION --- */}
              
              <Button 
                variant="contained" startIcon={<TaskAltIcon />} onClick={handleAddChecklist} 
                sx={{ justifyContent: 'flex-start', bgcolor: '#091e420a', color: '#172b4d', boxShadow: 'none', fontWeight: 'bold', '&:hover': { bgcolor: '#091e4214', boxShadow: 'none' } }}
              >
                Checklist
              </Button>
              
              <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleUploadAttachment} />
              <Button 
                variant="contained" startIcon={<AttachmentIcon />} onClick={() => fileInputRef.current.click()} 
                sx={{ justifyContent: 'flex-start', bgcolor: '#091e420a', color: '#172b4d', boxShadow: 'none', fontWeight: 'bold', '&:hover': { bgcolor: '#091e4214', boxShadow: 'none' } }}
              >
                Attachment
              </Button>

              <Divider sx={{ my: 2 }} />
              
              {/* Delete Button - Khác biệt màu sắc */}
              <Button 
                variant="contained" startIcon={<DeleteIcon />} onClick={handleDeleteCard} 
                sx={{ 
                    justifyContent: 'flex-start', 
                    bgcolor: '#ffeaea', color: '#c9372c', boxShadow: 'none', fontWeight: 'bold', 
                    '&:hover': { bgcolor: '#ffdce0', boxShadow: 'none' } 
                }}
              >
                Delete
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Box>
    </Modal>
  )
}

export default ActiveCardModal