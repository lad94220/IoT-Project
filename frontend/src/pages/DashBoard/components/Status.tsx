import { Box, Typography } from '@mui/material'
import { Power } from 'lucide-react'

const RoundStyle = {
  borderRadius: '50%',
  borderWidth: 4,
  width: { xs: 120, sm: 140, md: 150, lg: 210 },
  height: { xs: 120, sm: 140, md: 150, lg: 210 },
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center',
  margin: 'auto',
  flexDirection: 'column',
}

const offColor = '#cbd5e1'
const onColor = '#5f98f5'

const glowPulse = {
  transition: 'box-shadow 0.3s, background 0.3s',
  '@keyframes glowPulse': {
    '0%': {
      boxShadow:
        'inset 0 0 10px rgba(255, 255, 255, 0.2), inset 0 0 20px rgba(255, 255, 255, 0.1)',
    },
    '50%': {
      boxShadow:
        'inset 0 0 24px rgba(255, 255, 255, 0.5), inset 0 0 48px rgba(255, 255, 255, 0.25)',
    },
    '100%': {
      boxShadow:
        'inset 0 0 10px rgba(255, 255, 255, 0.2), inset 0 0 20px rgba(255, 255, 255, 0.1)',
    },
  },
}

interface StatusProps {
  status: boolean
}

export const Status : React.FC<StatusProps> = ({
  status
}) => {
  const color = status ? onColor : offColor

  return (
    <Box sx={{padding: "16px 16px 24px", height: '90%'}}>
      <Typography variant='h4' color='primary' sx={{textAlign: 'center', fontWeight: 'bold'}}>Device Status</Typography>
      <Box sx={{ height: '95%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Box>
            <Box
              sx={{
                ...RoundStyle,
                background: status
                  ? 'radial-gradient(circle at center, #5f98f5 0%, #3a6fcf 100%)'
                  : 'radial-gradient(circle at center, #cbd5e1 0%, #94a3b8 100%)',
                color: status ? '#ffffff' : '#94a3b8',
                animation: status ? 'glowPulse 1s ease-in-out infinite' : 'none',
                transition: glowPulse
              }}
            >
              <Power color={status ? 'white' : '#94a3b8'} size={48} />
            </Box>
            <Typography variant='h6' sx={{ color: color, textAlign: 'center', marginTop: 2 }}>{status ? "ON" : "OFF"}</Typography> 
        </Box>
      </Box>
    </Box>
  )
}