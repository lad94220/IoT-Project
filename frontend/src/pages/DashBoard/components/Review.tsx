import { Box, Typography} from '@mui/material'
import { useEffect, useState } from 'react'
import type { DayDataDTO } from '../../../types'
import { Chart } from 'react-chartjs-2'
import { 
Chart as ChartJS, 
CategoryScale, 
LinearScale, 
BarElement,
LineElement,
PointElement, 
Title, 
Tooltip, 
Legend,
type ChartData,
type ChartOptions
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
)

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

interface ReviewProps {
  dayData: DayDataDTO[] | undefined
}

export const Review : React.FC<ReviewProps> = ({ 
  dayData = []
}) => {
  const [isHaveData, setIsHaveData] = useState(true)
  
  useEffect(() => {
    if (!dayData || dayData.length === 0) {
      setIsHaveData(false)
    } else {
      setIsHaveData(true)
    }
  }, [dayData])

  const data: ChartData<'bar' | 'line'> = {
    labels: dayData?.map((data) => {
      const date = new Date(data.date)
      return `${months[date.getMonth()]} ${date.getDate()}`
    }),
    datasets: [
      {
        type: 'line' as const,
        label: 'Total Consumption (Wh)',
        data: dayData?.map((data) => data.total_consumption),
        backgroundColor: 'rgba(96, 165, 250, 1)',
        borderColor: 'rgba(96, 165, 250, 1)',
        borderWidth: 3,
        tension: 0.4,
        fill: true,
        yAxisID: 'y1'
      },
      {
        type: 'bar' as const,
        label: 'Total Activation (times)',
        data: dayData?.map((data) => data.total_activation),
        backgroundColor: 'rgba(248, 113, 113, 0.8)',
        yAxisID: 'y'
      }
    ]
  }

  const options: ChartOptions<'bar' | 'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const
      }
    },
    scales: {
      y: {
        position: 'left' as const,
        stacked: true,
        title: {
          display: true,
          text: 'times'
        }
      },
      y1: {
        position: 'right' as const,
        title: {
          display: true,
          text: 'Wh'
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  }

  return (
    <Box sx={{ padding: '16px 16px 24px', height: '90%' }}>
      <Typography variant='h4' color="primary" sx={{textAlign: 'center', fontWeight: 'bold'}}>Review</Typography>
      <Box sx={{ height: '92%', display: 'flex', justifyContent: 'center' }}>
        {isHaveData ? <Chart type='bar' data={data} options={options} /> 
                    : <Typography variant='body1' color="textSecondary" sx={{textAlign: 'center'}}>
                        No data available for the last 7 days.
                      </Typography>
                      }
      </Box>
    </Box>
  )
}