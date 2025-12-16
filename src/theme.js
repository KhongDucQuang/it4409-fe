import { experimental_extendTheme as extendTheme } from '@mui/material/styles'

const APP_BAR_HEIGHT = '58px'
const BOARD_BAR_HEIGHT = '60px'
const BOARD_CONTENT_HEIGHT = `calc(100vh - ${APP_BAR_HEIGHT} - ${BOARD_BAR_HEIGHT})`
const COLUMN_HEADER_HEIGHT = '50px'
const COLUMN_FOOTER_HEIGHT = '56px'

// Create a theme instance.
const theme = extendTheme({
  trello: {
    appBarHeight: APP_BAR_HEIGHT,
    boardBarHeight: BOARD_BAR_HEIGHT,
    boardContentHeight: BOARD_CONTENT_HEIGHT,
    columnHeaderHeight: COLUMN_HEADER_HEIGHT,
    columnFooterHeight: COLUMN_FOOTER_HEIGHT
  },
  
  // 1. Cấu hình Font chữ mới (Nunito)
  typography: {
    fontFamily: 'Nunito, sans-serif',
    button: {
      textTransform: 'none',
      fontWeight: 'bold'
    }
  },

  colorSchemes: {
    // light: {},
    // dark: {}
  },

  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          // 2. Cấu hình Scrollbar đẹp hơn
          '*::-webkit-scrollbar': {
            width: '8px',
            height: '8px'
          },
          '*::-webkit-scrollbar-track': {
            backgroundColor: '#f1f1f1',
            borderRadius: '8px'
          },
          '*::-webkit-scrollbar-thumb': {
            backgroundColor: '#ced0da', // Màu xám nhẹ
            borderRadius: '8px',
          },
          '*::-webkit-scrollbar-thumb:hover': {
            backgroundColor: '#bfc2c7' // Đậm hơn khi hover
          }
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: '600' // Chữ trong nút đậm hơn chút cho đẹp
        },
        outlined: {
          borderWidth: '1px', // Viền nút rõ hơn
          borderColor: '#ced0da',
          '&:hover': {
            borderWidth: '1px',
            borderColor: '#172b4d' // Màu đậm khi hover giống Trello
          }
        }
      }
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          fontSize: '0.875rem'
        }
      }
    },
    MuiTypography: {
      styleOverrides: {
        root: { 
            fontSize: '0.875rem' 
        }
      }
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          fontSize: '0.875rem',
          '& fieldset': { borderWidth: '1px !important' }, // Luôn hiện viền mỏng
          '&:hover fieldset': { borderWidth: '1px !important', borderColor: '#172b4d !important' },
          '&.Mui-focused fieldset': { borderWidth: '2px !important', borderColor: '#1976d2 !important' } // Focus đậm hơn
        }
      }
    }
  }
})

export default theme