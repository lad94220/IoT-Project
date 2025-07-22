import { AppBar, Box, Button, Toolbar, Typography } from "@mui/material"

interface NavBarProps {
  onLogout: () => void
}

export const NavBar : React.FC<NavBarProps> = ({
  onLogout
}) => {

  return (
    <Box padding={4} sx={{ flexGrow: 1 }}>
      <AppBar>
        <Toolbar sx={{ padding: '12px' }}>
          <Typography 
            variant="h4" 
            component='div' 
            sx={{ 
              color:'text.primary',
              flexGrow:'1',
              marginLeft: '34px'
              }}
            >
            Dash Board
          </Typography>
          <Button color="inherit" sx={{fontSize:'20px', marginRight: '34px'}} onClick={onLogout}>LOG OUT</Button>
        </Toolbar>
      </AppBar>
    </Box>
  )
} 