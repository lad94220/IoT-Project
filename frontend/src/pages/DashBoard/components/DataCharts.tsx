import { Box, Grid, Typography } from "@mui/material"

const RoundStyle = {
  borderRadius: '50%',
  border: 4,
  color: 'primary.main',
  width: { xs: 120, sm: 140, md: 150, lg: 210 },
  height: { xs: 120, sm: 140, md: 150, lg: 210 },
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center',
  margin: 'auto',
  flexDirection: 'column',
}

const DataGrid = (label: string, data: number) => {
  return (
    <Grid size={4} sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      <Box>
        <Box sx={RoundStyle}>
          <Typography variant="h3" color='primary'>{data}</Typography>
        </Box>
        <Typography variant='h6' sx={{ color: 'primary.main', textAlign: 'center', marginTop: 2 }}>{label}</Typography>
      </Box>
    </Grid>
  )
}

interface DataChartsProps {
  current: number;
  voltage: number;
}

export const DataCharts : React.FC<DataChartsProps> = ({
  current,
  voltage 
}) => {

  return (
    <Box sx={{ padding: '16px 16px 24px', height: '90%' }}>
      <Typography variant='h4' color='primary' sx={{textAlign: 'center', fontWeight: 'bold'}}>Data</Typography>
        <Grid container size={12} sx={{ height: '95%' }}>
            {DataGrid('Ampes', Number(current.toFixed(3)))}
          {DataGrid('Volts', Number(voltage.toFixed(3)))}
          {DataGrid('Watts', Number((current * voltage).toFixed(3)))}
        </Grid>
    </Box>
  )
}