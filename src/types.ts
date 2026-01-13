export type Estado = 'verde' | 'amarillo' | 'rojo'

export type CalleSegment = {
  id: string
  calle: string
  desde: string
  hasta: string
  estado: Estado
  coords: [number, number][]
  fotoUrl?: string
  nota?: string
}

export const ESTADOS: Estado[] = ['verde', 'amarillo', 'rojo']
