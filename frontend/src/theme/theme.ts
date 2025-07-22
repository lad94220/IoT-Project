import { createTheme } from '@mui/material'

export const theme = createTheme({
  palette: {
    primary: {
      main: '#1769aa',
    },
    secondary: {
      main: '#2980b9',
      light: '#3498db'
    },
    text: {
      primary: '#ffffff',
      secondary: '#e3f2fd',
    },
    success: {
      main: '#43a047',
    },
    error: {
      main: '#e53935',
    },
  },
  typography: {
    fontFamily: 'Inter, sans-serif',
  }
})