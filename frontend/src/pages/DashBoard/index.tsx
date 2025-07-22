import { Box, Grid } from "@mui/material"
import { Control, TodayCount, Review, History, DataCharts, NavBar, Status } from './components'
import { useEffect, useState } from 'react'
import { trpc } from "../../libs"
import type { DayDataDTO, HistoryDataDTO } from "../../types/index.ts"
import {
  socket,
  socketControlDevice,
  socketControlAutoMode
} from '../../libs'
import { useUser } from "../../context/userContext.tsx"
import { useNavigate } from "react-router-dom"

const chartBoxStyle = {
  borderRadius: '8px',
  boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.3)',
  padding: '8px',
  border: 2,
  borderColor: 'primary.main',
  height: '39vh',
}

export const DashBoard = () => {
  const daysDataQuery = trpc.fetchDayData.useQuery({number : 7})
  const daysData = daysDataQuery.data as DayDataDTO[] | undefined
  const todayDataQuery = trpc.fetchTodayData.useQuery()
  const todayData = todayDataQuery.data as DayDataDTO | undefined
  const historyDataQuery = trpc.fetchHistory.useQuery({numbers: 5})
  const historyData = historyDataQuery.data as HistoryDataDTO[] | undefined

  const [autoMode, setAutoMode] = useState(true)
  const [isOn, setIsOn] = useState(false)
  const [status, setStatus] = useState(false)
  const [current, setCurrent] = useState(0)
  const [voltage, setVoltage] = useState(0)

  const user= useUser()
  const navigate = useNavigate()

  const handleAutoModeChange = () => {
    setAutoMode((prev) => {
      if (!prev) {
        setIsOn(false)
      }
      return !prev
    })
    socketControlAutoMode(!autoMode)
  }

  const handleManualMode = () => {
    setIsOn((prev) => {
      return !prev
    })
    socketControlDevice(!isOn)
  }

  const handleLogout = () => {
    user.setUser(null)
    navigate('/login')
  }

  useEffect(() => {
    const handleRefetch = () => {
      daysDataQuery.refetch()
      todayDataQuery.refetch()
      historyDataQuery.refetch()
    }

    socket.on('refetch', handleRefetch)
    return () => {
      socket.off('refetch', handleRefetch)
    }
  }, [])

  useEffect(() => {
    const handleStatusUpdate = (status: boolean) => {
      setStatus(status)
      if (!status) {
        setCurrent(0)
        setVoltage(0)
      }
    }

    socket.on('status', handleStatusUpdate)
    return () => {
      socket.off('status', handleStatusUpdate)
    }
  })

  useEffect(() => {
    const handleDataUpdate = (data: { current: number, voltage: number }) => {
      setCurrent(data.current)
      setVoltage(data.voltage)
    }

    socket.on('sensorData', handleDataUpdate)
    return () => {
      socket.off('sensorData', handleDataUpdate)
    }
  })

  return (
    <Box sx={{ height: '98vh' }}>
      <NavBar onLogout={handleLogout}/>
      <Grid container spacing={2} padding={2} alignItems="stretch" margin={3.8}>
        <Grid size={2.5}>
          <Box sx={chartBoxStyle}>
            <TodayCount todayData={todayData}/>
          </Box>
        </Grid>
        <Grid size={7}>
          <Box sx={chartBoxStyle}>
            <Review dayData={daysData}/>
          </Box>
        </Grid>
        <Grid size={2.5}>
          <Box sx={chartBoxStyle}>
            <History historyData={historyData}/>
          </Box>
        </Grid>
        <Grid size={2.5}>
          <Box sx={chartBoxStyle}>
            <Status status={status}/>
          </Box>
        </Grid>
        <Grid size={7}>
          <Box sx={chartBoxStyle}>
            <DataCharts current={current} voltage={voltage}/>
          </Box>
        </Grid>
        <Grid size={2.5}>
          <Box sx={chartBoxStyle}>
            <Control autoMode={autoMode}
                     isOn={isOn} 
                     handleAutoModeChange={handleAutoModeChange}
                     handelManualModeChange={handleManualMode}
                     />
          </Box>
        </Grid>
      </Grid>
    </Box>
  )
}