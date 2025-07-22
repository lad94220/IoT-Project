import { Box, Typography} from "@mui/material"
import type { HistoryDataDTO } from '../../../types'

const BoxStyles = {
  height: '90%', 
  display: 'flex', 
  alignItems: 'center', 
  justifyContent: 'center', 
  overflowY: 'hidden'
}

interface HistoryProps {
  historyData: HistoryDataDTO[] | undefined
}

const options: Intl.DateTimeFormatOptions = {
  timeZone: "Asia/Bangkok",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit"
}

export const History : React.FC<HistoryProps> = ({
  historyData = []
}) => {

  return (
    <Box sx={{ padding: '16px 16px 24px', height: '90%' }}>
      <Typography variant='h4' color='primary' sx={{textAlign: 'center', fontWeight: 'bold'}}>History</Typography>
      <Box sx={BoxStyles}>
        <Box>
          {historyData.slice(0, 5).map((item, index) => (
            <Box key={index} sx={{ padding: 1.5, borderBottom: '1px solid #ccc', alignItems: 'center', justifyContent: 'center' }}>
              <Typography color='primary' align="center" fontSize='1.1rem'>
                {new Date(item.date).toLocaleString('en-US', options)} - {item.duration}s
                </Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  )
}