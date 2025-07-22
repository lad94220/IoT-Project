import { Box, Typography, Switch, FormControlLabel } from "@mui/material"

const SwitchContainerStyle = {
  display: 'flex', 
  justifyContent: 'center', 
  flexDirection: 'column',
  height: '95%',
  paddingLeft: '20%',
  overflow: 'hidden' 
}

const SwitchStyle = {
  transform: 'scale(1.5)'
}

const SwitchLabelStyle = {
  '.MuiFormControlLabel-label': {
    fontSize: '1.5rem',
    color: 'primary.main',
    padding: 2,
  }
}

interface ControlProps {
  autoMode: boolean
  isOn: boolean
  handleAutoModeChange: () => void
  handelManualModeChange: () => void
}

export const Control: React.FC<ControlProps> = ({
  autoMode,
  isOn,
  handleAutoModeChange,
  handelManualModeChange
}) => {

  return (
    <Box sx={{ padding: '16px 16px 24px', height: '90%' }}>
      <Typography variant='h4' color='primary' sx={{textAlign: 'center', fontWeight: 'bold'}}>Control</Typography>
      <Box sx={SwitchContainerStyle}>
          <FormControlLabel control={<Switch checked={autoMode} 
                                             sx={SwitchStyle} 
                                             onChange={handleAutoModeChange}
                                             />} 
                            label="Auto Mode" 
                            sx={SwitchLabelStyle}/>
          <FormControlLabel control={<Switch sx={SwitchStyle} 
                                             checked={isOn} 
                                             disabled={autoMode} 
                                             onChange={handelManualModeChange}
                                             />} 
                            label="Turn On (Manually)" 
                            sx={SwitchLabelStyle}/>
        </Box>
    </Box>
  )
}