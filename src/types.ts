export type Estado = 'verde' | 'amarillo' | 'rojo'

export type CalleSegment = {
  id: string
  calle: string
  desde: string
  hasta: string
  estado: 'verde' | 'amarillo' | 'rojo'
  coords: [number, number][]
  updatedAt: string
  lengthMeters: number

  // media
  fotoUrl?: string
  nota?: string
}



export const ESTADOS: Estado[] = ['verde', 'amarillo', 'rojo']

export type RawSegment = {
  id?: string
  calle: string
  desde: string
  hasta: string
  estado: 'verde' | 'amarillo' | 'rojo'
  coords: [number, number][]
  updatedAt?: string
  lengthMeters?: number
}
