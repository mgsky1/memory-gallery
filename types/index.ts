export type Season = '春' | '夏' | '秋' | '冬'

export type TimeEvent = {
  id: number
  year: number
  season: Season
}

export type Photo = {
  id: number
  src: string
  year: number
  season: Season
  alt: string
  story?: string
  location: string
} 