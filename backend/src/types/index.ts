import type { AppRouter } from '../index'

export interface DayDataDTO {
  date: Date;
  total_consumption: number;
  total_activation: number;
}

export interface HistoryDataDTO {
  date: Date;
  duration: number;
}

export type { AppRouter }