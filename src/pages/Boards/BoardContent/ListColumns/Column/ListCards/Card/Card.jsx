import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import { Card as MuiCard, Box, Chip, Avatar, AvatarGroup } from '@mui/material'
import CardContent from '@mui/material/CardContent'
import CardMedia from '@mui/material/CardMedia'
import CardActions from '@mui/material/CardActions'
import GroupIcon from '@mui/icons-material/Group'
import CommentIcon from '@mui/icons-material/Comment'
import AttachmentIcon from '@mui/icons-material/Attachment'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

function Card({ card, handleSetActiveCard }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({
      id: card._id,
      data: { ...card }
    })

  const dndKitCardStyles = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  }

  const shouldShowCardActions = () => {
    return (
      !!card?.memberIds?.length ||
      !!card?.comments?.length ||
      !!card?.attachments?.length
    )
  }

  const handleClick = () => {
    if (handleSetActiveCard) handleSetActiveCard(card)
  }

  return (
    <MuiCard
      onClick={handleClick}
      ref={setNodeRef}
      style={dndKitCardStyles}
      {...attributes}
      {...listeners}
      sx={{
        cursor: 'pointer',
        borderRadius: '8px',
        boxShadow: '0 1px 1px rgba(9,30,66,0.25)',
        overflow: 'hidden',
        display: card?.FE_PlaceholderCard ? 'none' : 'block',
        backgroundColor: '#ffffff',
        border: 'none',
        flexShrink: 0,
        width: '100%',
        '&:hover': {
          backgroundColor: '#f4f5f7',
          boxShadow: '0 4px 8px rgba(9,30,66,0.25)'
        },
        // Styling khi đang kéo
        ...(isDragging && {
          transform: 'rotate(5deg)',
          boxShadow: '0 8px 16px rgba(9,30,66,0.3)'
        })
      }}
    >
      {card?.cover && (
        <CardMedia
          sx={{
            height: 160,
            minHeight: 160,
            flexShrink: 0,
            backgroundPosition: 'center',
            backgroundSize: 'cover'
          }}
          image={card?.cover}
        />
      )}

      <CardContent
        sx={{
          p: '8px 12px 4px',
          '&:last-child': { pb: '8px' },
          minHeight: '36px'
        }}
      >
        <Typography
          sx={{
            fontSize: '14px',
            fontWeight: 400,
            lineHeight: '20px',
            color: '#172b4d',
            wordWrap: 'break-word',
            whiteSpace: 'normal',
            mb: shouldShowCardActions() ? 0.5 : 0
          }}
        >
          {card?.title}
        </Typography>

        {shouldShowCardActions() && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              mt: 1,
              flexWrap: 'wrap'
            }}
          >
            {/* Labels/Tags nếu có */}
            
            {/* Members */}
            {!!card?.memberIds?.length && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <GroupIcon 
                  sx={{ 
                    fontSize: '16px', 
                    color: '#5e6c84' 
                  }} 
                />
                <Typography
                  sx={{
                    fontSize: '12px',
                    color: '#5e6c84',
                    fontWeight: 400
                  }}
                >
                  {card?.memberIds?.length}
                </Typography>
              </Box>
            )}

            {/* Comments */}
            {!!card?.comments?.length && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <CommentIcon 
                  sx={{ 
                    fontSize: '16px', 
                    color: '#5e6c84' 
                  }} 
                />
                <Typography
                  sx={{
                    fontSize: '12px',
                    color: '#5e6c84',
                    fontWeight: 400
                  }}
                >
                  {card?.comments?.length}
                </Typography>
              </Box>
            )}

            {/* Attachments */}
            {!!card?.attachments?.length && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <AttachmentIcon 
                  sx={{ 
                    fontSize: '16px', 
                    color: '#5e6c84' 
                  }} 
                />
                <Typography
                  sx={{
                    fontSize: '12px',
                    color: '#5e6c84',
                    fontWeight: 400
                  }}
                >
                  {card?.attachments?.length}
                </Typography>
              </Box>
            )}
          </Box>
        )}
      </CardContent>
    </MuiCard>
  )
}

export default Card