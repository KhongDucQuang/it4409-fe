import Box from '@mui/material/Box'
import Column from './Column/Column'
import NoteAddIcon from '@mui/icons-material/NoteAdd'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import CloseIcon from '@mui/icons-material/Close'
import AddIcon from '@mui/icons-material/Add'
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable'
import { useState } from 'react'

function ListColumns({
  columns,
  createNewColumn,
  createNewCard,
  handleSetActiveCard,
  handleDeleteColumn
}) {
  const [openNewColumnForm, setOpenNewColumnForm] = useState(false)
  const [newColumnTitle, setNewColumnTitle] = useState('')

  const toggleOpenNewColumnForm = () => setOpenNewColumnForm(!openNewColumnForm)

  const addNewColumn = async () => {
    if (!newColumnTitle) return
    await createNewColumn({ title: newColumnTitle })
    toggleOpenNewColumnForm()
    setNewColumnTitle('')
  }

  return (
    <SortableContext
      items={columns?.map(c => c._id)}
      strategy={horizontalListSortingStrategy}
    >
      <Box
        sx={{
          bgcolor: 'inherit',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'flex-start',
          overflowX: 'auto',
          overflowY: 'hidden',
          px: 1,

          // Scrollbar ngang giống Trello
          '&::-webkit-scrollbar': {
            height: '12px'
          },
          '&::-webkit-scrollbar-track': {
            margin: '8px',
            background: 'transparent'
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: '#ffffff3d',
            borderRadius: '8px',
            border: '3px solid transparent',
            backgroundClip: 'padding-box'
          },
          '&::-webkit-scrollbar-thumb:hover': {
            backgroundColor: '#ffffff52'
          }
        }}
      >
        {/* Columns */}
        {columns?.map(column => (
          <Column
            key={column._id}
            column={column}
            createNewCard={createNewCard}
            handleSetActiveCard={handleSetActiveCard}
            handleDeleteColumn={handleDeleteColumn}
          />
        ))}

        {/* ===== Add New Column ===== */}
        {!openNewColumnForm ? (
          <Box
            onClick={toggleOpenNewColumnForm}
            sx={{
              minWidth: 272,
              maxWidth: 272,
              ml: 1,
              mr: 1,
              borderRadius: '12px',
              height: 'fit-content',
              bgcolor: '#ffffff3d',
              cursor: 'pointer',
              transition: 'background-color 0.2s ease',
              '&:hover': {
                bgcolor: '#ffffff52'
              }
            }}
          >
            <Button
              startIcon={<AddIcon />}
              sx={{
                color: 'white',
                width: '100%',
                justifyContent: 'flex-start',
                pl: '12px',
                py: '10px',
                textTransform: 'none',
                fontSize: '14px',
                fontWeight: 500
              }}
            >
              Add another list
            </Button>
          </Box>
        ) : (
          <Box
            sx={{
              minWidth: 272,
              maxWidth: 272,
              ml: 1,
              mr: 1,
              p: '8px',
              borderRadius: '12px',
              bgcolor: '#ebecf0',
              display: 'flex',
              flexDirection: 'column',
              gap: 1
            }}
          >
            <TextField
              placeholder="Enter list title..."
              size="small"
              autoFocus
              value={newColumnTitle}
              onChange={(e) => setNewColumnTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addNewColumn()
                }
                if (e.key === 'Escape') {
                  toggleOpenNewColumnForm()
                  setNewColumnTitle('')
                }
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: '#ffffff',
                  fontSize: '14px',
                  '& fieldset': {
                    borderColor: '#091e4221',
                    borderWidth: '2px'
                  },
                  '&:hover fieldset': {
                    borderColor: '#091e424f'
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#0079bf',
                    borderWidth: '2px'
                  }
                },
                '& .MuiOutlinedInput-input': {
                  p: '8px 12px'
                }
              }}
            />

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Button
                onClick={addNewColumn}
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
                Add list
              </Button>

              <Box
                onClick={toggleOpenNewColumnForm}
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
    </SortableContext>
  )
}

export default ListColumns