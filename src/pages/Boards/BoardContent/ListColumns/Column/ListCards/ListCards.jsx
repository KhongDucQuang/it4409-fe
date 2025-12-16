import Box from '@mui/material/Box'
import Card from './Card/Card'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'

function ListCards({ cards, handleSetActiveCard }) {
  return (
    <SortableContext
      items={cards?.map(c => c._id)}
      strategy={verticalListSortingStrategy}
    >
      <Box
        sx={{
          p: '0 8px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          overflowX: 'hidden',
          overflowY: 'auto',

          // Chiều cao chuẩn Trello
          maxHeight: (theme) =>
            `calc(${theme.trello.boardContentHeight} 
              - ${theme.spacing(5)} 
              - ${theme.trello.columnHeaderHeight} 
              - ${theme.trello.columnFooterHeight})`,

          // Scrollbar styling giống Trello 100%
          '&::-webkit-scrollbar': {
            width: '8px',
            height: '8px'
          },
          '&::-webkit-scrollbar-track': {
            margin: '4px',
            borderRadius: '8px',
            backgroundColor: 'transparent'
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'transparent',
            borderRadius: '8px',
            border: '2px solid transparent',
            backgroundClip: 'padding-box'
          },
          
          // Chỉ hiện scrollbar khi hover vào list
          '&:hover::-webkit-scrollbar-thumb': {
            backgroundColor: '#091e4221',
            '&:hover': {
              backgroundColor: '#091e424f'
            }
          },

          // Firefox scrollbar
          scrollbarWidth: 'thin',
          scrollbarColor: 'transparent transparent',
          '&:hover': {
            scrollbarColor: '#091e4221 transparent'
          },

          // Smooth scrolling
          scrollBehavior: 'smooth',

          // Padding bottom để card cuối không bị sát đáy
          pb: 1
        }}
      >
        {cards?.map(card => (
          <Card
            key={card._id}
            card={card}
            handleSetActiveCard={handleSetActiveCard}
          />
        ))}
      </Box>
    </SortableContext>
  )
}

export default ListCards