export type Estado = 'verde' | 'amarillo' | 'rojo'

export type CalleSegment = {
  calle: string
  desde: string
  hasta: string
  estado: Estado
  coords: [number, number][]
}

export const ESTADOS: Estado[] = ['verde', 'amarillo', 'rojo']
