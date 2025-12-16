import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import ListItemText from '@mui/material/ListItemText'
import ListItemIcon from '@mui/material/ListItemIcon'
import Divider from '@mui/material/Divider'
import ContentCut from '@mui/icons-material/ContentCut'
import ContentCopy from '@mui/icons-material/ContentCopy'
import ContentPaste from '@mui/icons-material/ContentPaste'
import Cloud from '@mui/icons-material/Cloud'
import MoreHorizIcon from '@mui/icons-material/MoreHoriz'
import React, { useState } from 'react'
import Tooltip from '@mui/material/Tooltip'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import AddCardIcon from '@mui/icons-material/AddCard'
import Button from '@mui/material/Button'
import DragHandleIcon from '@mui/icons-material/DragHandle'
import ListCards from './ListCards/ListCards'
import { mapOrder } from '~/utils/sorts'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import TextField from '@mui/material/TextField'
import CloseIcon from '@mui/icons-material/Close'
import { useConfirm } from 'material-ui-confirm'

function Column({ column, createNewCard, handleSetActiveCard, handleDeleteColumn }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({
      id: column._id,
      data: { ...column }
    })

  const dndKitColumnStyles = {
    transform: CSS.Translate.toString(transform),
    transition,
    height: '100%',
    opacity: isDragging ? 0.5 : 1
  }

  const [anchorEl, setAnchorEl] = React.useState(null)
  const open = Boolean(anchorEl)
  const handleClick = (event) => setAnchorEl(event.currentTarget)
  const handleClose = () => setAnchorEl(null)

  const [openNewCardForm, setOpenNewCardForm] = useState(false)
  const [newCardTitle, setNewCardTitle] = useState('')

  const toggleOpenNewCardForm = () => setOpenNewCardForm(!openNewCardForm)

  const addNewCard = async () => {
    if (!newCardTitle) return
    await createNewCard({ title: newCardTitle, columnId: column._id })
    toggleOpenNewCardForm()
    setNewCardTitle('')
  }

  const confirm = useConfirm()
  const confirmDeleteColumn = () => {
    confirm({
      title: 'Xóa cột?',
      description: `Hành động này sẽ xóa vĩnh viễn cột "${column.title}" và toàn bộ thẻ bên trong!`,
      confirmationText: 'Xác nhận',
      cancellationText: 'Hủy'
    }).then(() => handleDeleteColumn(column._id))
  }

  const orderedCards = mapOrder(column?.cards, column?.cardOrderIds, '_id')

  return (
    <div ref={setNodeRef} style={dndKitColumnStyles} {...attributes}>
      <Box
        {...listeners}
        sx={{
          minWidth: 272,
          maxWidth: 272,
          bgcolor: '#ebecf0',
          borderRadius: '12px',
          ml: 1,
          mr: 1,
          display: 'flex',
          flexDirection: 'column',
          maxHeight: (theme) =>
            `calc(${theme.trello.boardContentHeight} - ${theme.spacing(5)})`,
          
          // Khi đang drag
          ...(isDragging && {
            opacity: 0.5
          })
        }}
      >
        {/* ===== Column Header ===== */}
        <Box
          sx={{
            height: (theme) => theme.trello.columnHeaderHeight,
            p: '10px 8px 8px 12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <Typography
            sx={{
              fontSize: '14px',
              fontWeight: 600,
              color: '#172b4d',
              wordBreak: 'break-word',
              cursor: 'pointer',
              px: '4px',
              flex: 1,
              userSelect: 'none'
            }}
          >
            {column?.title}
          </Typography>

          <Tooltip title="List actions">
            <Box
              onClick={handleClick}
              sx={{
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '8px',
                cursor: 'pointer',
                color: '#172b4d',
                '&:hover': {
                  bgcolor: '#091e4214'
                }
              }}
            >
              <MoreHorizIcon sx={{ fontSize: '20px' }} />
            </Box>
          </Tooltip>

          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            PaperProps={{
              sx: {
                borderRadius: '8px',
                boxShadow: '0 8px 16px -4px rgba(9,30,66,0.25), 0 0 1px rgba(9,30,66,0.31)',
                minWidth: '304px'
              }
            }}
          >
            <Box sx={{ px: 2, py: 1.5, textAlign: 'center', position: 'relative' }}>
              <Typography sx={{ fontSize: '14px', fontWeight: 600, color: '#172b4d' }}>
                List actions
              </Typography>
              <CloseIcon
                onClick={handleClose}
                sx={{
                  position: 'absolute',
                  right: 8,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  cursor: 'pointer',
                  fontSize: '20px',
                  color: '#626f86',
                  '&:hover': { color: '#172b4d' }
                }}
              />
            </Box>
            <Divider />
            <MenuItem onClick={handleClose} sx={{ fontSize: '14px', py: 1 }}>
              <ListItemIcon><AddCardIcon fontSize="small" /></ListItemIcon>
              <ListItemText>Add card</ListItemText>
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleClose} sx={{ fontSize: '14px', py: 1 }}>
              <ListItemIcon><ContentCopy fontSize="small" /></ListItemIcon>
              <ListItemText>Copy list</ListItemText>
            </MenuItem>
            <MenuItem onClick={handleClose} sx={{ fontSize: '14px', py: 1 }}>
              <ListItemIcon><ContentCut fontSize="small" /></ListItemIcon>
              <ListItemText>Move list</ListItemText>
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleClose} sx={{ fontSize: '14px', py: 1 }}>
              <ListItemIcon><Cloud fontSize="small" /></ListItemIcon>
              <ListItemText>Archive this list</ListItemText>
            </MenuItem>
            <MenuItem 
              onClick={() => {
                handleClose()
                confirmDeleteColumn()
              }} 
              sx={{ 
                fontSize: '14px', 
                py: 1,
                color: '#b04632',
                '&:hover': {
                  bgcolor: '#eb5a461f'
                }
              }}
            >
              <ListItemIcon>
                <DeleteForeverIcon fontSize="small" sx={{ color: '#b04632' }} />
              </ListItemIcon>
              <ListItemText>Delete this list</ListItemText>
            </MenuItem>
          </Menu>
        </Box>

        {/* ===== List Cards ===== */}
        <ListCards
          cards={orderedCards}
          handleSetActiveCard={handleSetActiveCard}
        />

        {/* ===== Column Footer ===== */}
        <Box
          sx={{
            height: (theme) => theme.trello.columnFooterHeight,
            p: '8px'
          }}
        >
          {!openNewCardForm ? (
            <Button
              fullWidth
              startIcon={<AddCardIcon sx={{ fontSize: '16px' }} />}
              onClick={toggleOpenNewCardForm}
              sx={{
                justifyContent: 'flex-start',
                pl: '10px',
                py: '6px',
                color: '#172b4d',
                fontSize: '14px',
                fontWeight: 400,
                textTransform: 'none',
                borderRadius: '8px',
                '&:hover': {
                  bgcolor: '#091e4214'
                }
              }}
            >
              Add a card
            </Button>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box
                sx={{
                  bgcolor: '#ffffff',
                  borderRadius: '8px',
                  boxShadow: '0 1px 0 rgba(9,30,66,0.25)',
                  border: 'none'
                }}
              >
                <TextField
                  placeholder="Enter a title for this card..."
                  autoFocus
                  multiline
                  fullWidth
                  data-no-dnd="true"
                  value={newCardTitle}
                  onChange={(e) => setNewCardTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      addNewCard()
                    }
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      fontSize: '14px',
                      lineHeight: '20px',
                      color: '#172b4d',
                      '& fieldset': {
                        border: 'none'
                      },
                      '&:hover fieldset': {
                        border: 'none'
                      },
                      '&.Mui-focused fieldset': {
                        border: 'none'
                      }
                    },
                    '& .MuiOutlinedInput-input': {
                      p: '8px 12px',
                      minHeight: '36px'
                    }
                  }}
                />
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Button
                  onClick={addNewCard}
                  variant="contained"
                  size="small"
                  sx={{
                    textTransform: 'none',
                    bgcolor: '#0079bf',
                    fontSize: '14px',
                    fontWeight: 400,
                    px: 1.5,
                    py: '6px',
                    borderRadius: '3px',
                    boxShadow: 'none',
                    '&:hover': {
                      bgcolor: '#026aa7',
                      boxShadow: 'none'
                    }
                  }}
                >
                  Add card
                </Button>
                <Box
                  onClick={toggleOpenNewCardForm}
                  sx={{
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '3px',
                    cursor: 'pointer',
                    color: '#626f86',
                    '&:hover': {
                      bgcolor: '#091e4214',
                      color: '#172b4d'
                    }
                  }}
                >
                  <CloseIcon sx={{ fontSize: '20px' }} />
                </Box>
              </Box>
            </Box>
          )}
        </Box>
      </Box>
    </div>
  )
}

export default Column