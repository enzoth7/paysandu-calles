import type { CalleSegment } from '../types'

type StatsBarProps = {
  segments: CalleSegment[]
}

const getPercent = (count: number, total: number) => {
  if (total === 0) {
    return 0
  }
  return Math.round((count / total) * 100)
}

export function StatsBar({ segments }: StatsBarProps) {
  const total = segments.length
  const counts = segments.reduce(
    (acc, segment) => {
      acc[segment.estado] += 1
      return acc
    },
    { rojo: 0, amarillo: 0, verde: 0 }
  )

  return (
    <div className="stats-bar">
      <div className="stats-title">Resumen (tramos relevados)</div>
      <div className="stats-items">
        <div className="stats-item stats-item--total">Total: {total}</div>
        <div className="stats-item stats-item--red">
          Rojo: {counts.rojo} ({getPercent(counts.rojo, total)}%)
        </div>
        <div className="stats-item stats-item--yellow">
          Amarillo: {counts.amarillo} ({getPercent(counts.amarillo, total)}%)
        </div>
        <div className="stats-item stats-item--green">
          Verde: {counts.verde} ({getPercent(counts.verde, total)}%)
        </div>
      </div>
    </div>
  )
}
