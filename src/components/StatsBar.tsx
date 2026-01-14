import type { CalleSegment } from '../types'

type StatsBarProps = {
  segments: CalleSegment[]
}

const getPercent = (value: number, total: number) => {
  if (total === 0) {
    return 0
  }
  return Math.round((value / total) * 100)
}

const formatMeters = (value: number) => {
  const rounded = Math.round(value)
  return `${rounded.toLocaleString('es-UY')} m`
}

export function StatsBar({ segments }: StatsBarProps) {
  const totals = segments.reduce(
    (acc, segment) => {
      const length = Number.isFinite(segment.lengthMeters) ? segment.lengthMeters : 0
      acc.total += length
      acc[segment.estado] += length
      acc.counts[segment.estado] += 1
      return acc
    },
    {
      total: 0,
      rojo: 0,
      amarillo: 0,
      verde: 0,
      counts: { rojo: 0, amarillo: 0, verde: 0 },
    }
  )

  return (
    <div className="stats-bar">
      <div className="stats-title">Resumen (tramos relevados)</div>
      <div className="stats-items">
        <div className="stats-item stats-item--total">
          Total relevado: {formatMeters(totals.total)}
        </div>
        <div className="stats-item stats-item--red">
          Rojo: {formatMeters(totals.rojo)} ({getPercent(totals.rojo, totals.total)}%)
          <span className="stats-item-secondary">
            {' '}
            · {totals.counts.rojo} tramos
          </span>
        </div>
        <div className="stats-item stats-item--yellow">
          Amarillo: {formatMeters(totals.amarillo)} (
          {getPercent(totals.amarillo, totals.total)}%)
          <span className="stats-item-secondary">
            {' '}
            · {totals.counts.amarillo} tramos
          </span>
        </div>
        <div className="stats-item stats-item--green">
          Verde: {formatMeters(totals.verde)} ({getPercent(totals.verde, totals.total)}%)
          <span className="stats-item-secondary">
            {' '}
            · {totals.counts.verde} tramos
          </span>
        </div>
      </div>
    </div>
  )
}
