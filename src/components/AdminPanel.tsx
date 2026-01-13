import { useEffect, useRef } from 'react'
import type { CalleSegment, Estado } from '../types'
import { ESTADOS } from '../types'

type AdminPanelProps = {
  segment: CalleSegment | null
  onChangeSegment: (changes: Partial<CalleSegment>) => void
  onDelete: () => void
  onExport: () => void
  focusToken: number
  isNewSegment: boolean
}

export function AdminPanel({
  segment,
  onChangeSegment,
  onDelete,
  onExport,
  focusToken,
  isNewSegment,
}: AdminPanelProps) {
  const calleInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (segment && calleInputRef.current) {
      calleInputRef.current.focus()
      calleInputRef.current.select()
    }
  }, [focusToken])

  const panelClassName = isNewSegment ? 'admin-panel admin-panel--highlight' : 'admin-panel'
  const fotoUrlValue = segment?.fotoUrl ?? ''
  const notaValue = segment?.nota ?? ''
  const fotoPlaceholder = segment ? `/fotos/${segment.id}.jpg` : '/fotos/PS-0001.jpg'
  const normalizeOptional = (value: string) => {
    const trimmed = value.trim()
    return trimmed.length > 0 ? trimmed : undefined
  }

  return (
    <aside className={panelClassName}>
      <div className="admin-panel-title">Panel de edicion</div>
      {segment ? (
        <div className="admin-panel-body">
          <div className="admin-panel-id">ID: {segment.id}</div>
          <label className="admin-panel-row admin-panel-field">
            <span className="admin-panel-label">Calle</span>
            <input
              ref={calleInputRef}
              type="text"
              value={segment.calle}
              onChange={(event) => onChangeSegment({ calle: event.target.value })}
            />
          </label>
          <label className="admin-panel-row admin-panel-field">
            <span className="admin-panel-label">Desde</span>
            <input
              type="text"
              value={segment.desde}
              onChange={(event) => onChangeSegment({ desde: event.target.value })}
            />
          </label>
          <label className="admin-panel-row admin-panel-field">
            <span className="admin-panel-label">Hasta</span>
            <input
              type="text"
              value={segment.hasta}
              onChange={(event) => onChangeSegment({ hasta: event.target.value })}
            />
          </label>
          <label className="admin-panel-row admin-panel-field">
            <span className="admin-panel-label">Foto URL</span>
            <input
              type="text"
              placeholder={fotoPlaceholder}
              value={fotoUrlValue}
              onChange={(event) =>
                onChangeSegment({ fotoUrl: normalizeOptional(event.target.value) })
              }
            />
          </label>
          <label className="admin-panel-row admin-panel-field">
            <span className="admin-panel-label">Nota</span>
            <textarea
              rows={3}
              value={notaValue}
              onChange={(event) =>
                onChangeSegment({ nota: normalizeOptional(event.target.value) })
              }
            />
          </label>
          <label className="admin-panel-row admin-panel-field">
            <span className="admin-panel-label">Estado</span>
            <select
              value={segment.estado}
              onChange={(event) => onChangeSegment({ estado: event.target.value as Estado })}
            >
              {ESTADOS.map((estado) => (
                <option key={estado} value={estado}>
                  {estado}
                </option>
              ))}
            </select>
          </label>
          <button className="admin-panel-delete" type="button" onClick={onDelete}>
            Eliminar tramo
          </button>
        </div>
      ) : (
        <p className="admin-panel-empty">
          Selecciona un tramo para editar sus datos.
        </p>
      )}
      <button className="admin-panel-export" type="button" onClick={onExport}>
        Exportar JSON
      </button>
      <p className="admin-panel-hint">
        Reemplaza el archivo public/data/calles.json con el exportado para que se vea en
        modo publico.
      </p>
    </aside>
  )
}
