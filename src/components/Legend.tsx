const LEGEND_ITEMS = [
  { label: 'Verde: buen estado', color: '#2ecc71' },
  { label: 'Amarillo: estado regular', color: '#f1c40f' },
  { label: 'Rojo: mal estado', color: '#e74c3c' },
]

export function Legend() {
  return (
    <aside className="legend">
      <h2 className="legend-title">Estado de calles</h2>
      <ul className="legend-list">
        {LEGEND_ITEMS.map((item) => (
          <li key={item.label} className="legend-item">
            <span className="legend-swatch" style={{ backgroundColor: item.color }} />
            <span className="legend-text">{item.label}</span>
          </li>
        ))}
      </ul>
    </aside>
  )
}
