import { Box, Typography} from "@mui/material"
import type { DayDataDTO } from "../../../types"
import { useEffect, useState } from "react"

const ContainerStyles = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100%',
  overflow: 'hidden'
}

const BoxStyles = {
  display: 'flex', 
  flexDirection: 'column', 
  alignItems: 'center', 
  borderTop: 1.5, 
  paddingTop: 1.5
}

interface TodayCountProps {
  todayData: DayDataDTO | undefined
}

const TotalPrototype = (label: string, value: string | number) => {
  return (
    <Box sx={BoxStyles}>
      <Typography variant="h6" color="primary">{label}</Typography>
      <Typography variant="h4" color="primary" sx={{ padding: 1.5 }}>{value}</Typography>
    </Box>
  )
}

export const TodayCount : React.FC<TodayCountProps> = ({
  todayData
}) => {
  const [date, setDate] = useState('')
  const [totalConsumption, setTotalConsumption] = useState(0)
  const [totalActivation, setTotalActivation] = useState(0)
  useEffect(() => {
    if (!todayData) return
    else {
      const date = new Date(todayData.date)
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      setDate(`${months[date.getMonth()]} ${date.getDate()} ${date.getFullYear()}`)
      setTotalConsumption(todayData.total_consumption)
      setTotalActivation(todayData.total_activation)
    }
  })
  
  return (
    <Box sx={{ padding: '16px 16px 24px', height: '90%' }}>
      <Typography variant='h4' color="primary" sx={{ textAlign: 'center', fontWeight: 'bold' }}>Today</Typography>
      <Box sx={ContainerStyles}>
        <Typography variant="h5" color="primary" sx={{ textAlign: 'center', paddingTop: 1.5 }}>{date}</Typography>
        <Box sx={{ padding: 2 }}>
          {TotalPrototype("Total Activation (times)", totalActivation)}
          {TotalPrototype("Total Consumption (Wh)", (totalConsumption.toFixed(3)))}
        </Box>
      </Box>
    </Box>
  )
}