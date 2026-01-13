import { useEffect, useState } from 'react'
import { AdminPanel } from './components/AdminPanel'
import { Legend } from './components/Legend'
import { MapView } from './components/MapView'
import { StatsBar } from './components/StatsBar'
import type { CalleSegment } from './types'

type AppMode = 'public' | 'admin'

type RawSegment = Omit<CalleSegment, 'id'> & { id?: string }

const getAppMode = (): AppMode => {
  const url = new URL(window.location.href)
  const isAdminParam = url.searchParams.get('admin') === 'true'
  const isAdminPath = url.pathname === '/admin' || url.pathname.startsWith('/admin/')
  return isAdminParam || isAdminPath ? 'admin' : 'public'
}

const assignIds = (data: RawSegment[]): CalleSegment[] => {
  const usedIds = new Set<string>()

  return data.map((segment, index) => {
    const rawId = typeof segment.id === 'string' ? segment.id.trim() : ''
    let id = rawId.length > 0 ? rawId : `PS-AUTO-${index + 1}`

    if (usedIds.has(id)) {
      let suffix = 2
      while (usedIds.has(`${id}-${suffix}`)) {
        suffix += 1
      }
      id = `${id}-${suffix}`
    }

    usedIds.add(id)
    return { ...segment, id }
  })
}

const getNextAutoId = (segments: CalleSegment[]) => {
  const used = new Set(segments.map((segment) => segment.id))
  let counter = segments.length + 1
  let candidate = `PS-AUTO-${counter}`

  while (used.has(candidate)) {
    counter += 1
    candidate = `PS-AUTO-${counter}`
  }

  return candidate
}

export function App() {
  const [mode] = useState<AppMode>(() => getAppMode())
  const [segments, setSegments] = useState<CalleSegment[]>([])
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [focusToken, setFocusToken] = useState(0)
  const [newSegmentIndex, setNewSegmentIndex] = useState<number | null>(null)

  useEffect(() => {
    // Load initial data and keep a local copy for admin edits.
    let active = true
    fetch('/data/calles.json')
      .then((response) => response.json())
      .then((data: RawSegment[]) => {
        if (active) {
          setSegments(assignIds(data))
        }
      })
      .catch((error) => {
        console.error('No se pudo cargar data/calles.json', error)
      })

    return () => {
      active = false
    }
  }, [])

  const selectedSegment = selectedIndex === null ? null : segments[selectedIndex] ?? null

  const handleSelectSegment = (index: number) => {
    setSelectedIndex(index)
    setNewSegmentIndex(null)
  }

  const handleSegmentChange = (changes: Partial<CalleSegment>) => {
    if (selectedIndex === null) {
      return
    }

    setSegments((prev) =>
      prev.map((segment, index) =>
        index === selectedIndex ? { ...segment, ...changes } : segment
      )
    )
    if (newSegmentIndex === selectedIndex) {
      setNewSegmentIndex(null)
    }
  }

  const handleDeleteSegment = () => {
    if (selectedIndex === null) {
      return
    }

    setSegments((prev) => {
      const next = prev.filter((_, index) => index !== selectedIndex)
      const nextIndex = next.length === 0 ? null : Math.min(selectedIndex, next.length - 1)
      setSelectedIndex(nextIndex)
      setNewSegmentIndex(null)
      return next
    })
  }

  const handleExport = () => {
    const payload = JSON.stringify(segments, null, 2)
    const blob = new Blob([payload], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')

    link.href = url
    link.download = 'calles.json'
    link.click()

    URL.revokeObjectURL(url)
  }

  const handleCreateSegment = (coords: [number, number][]) => {
    if (coords.length < 2) {
      return
    }

    setSegments((prev) => {
      const newSegment: CalleSegment = {
        id: getNextAutoId(prev),
        calle: 'Sin nombre',
        desde: '',
        hasta: '',
        estado: 'amarillo',
        coords,
      }
      const next = [...prev, newSegment]
      const newIndex = next.length - 1
      setSelectedIndex(newIndex)
      setNewSegmentIndex(newIndex)
      setFocusToken((token) => token + 1)
      return next
    })
  }

  return (
    <div className="app">
      <MapView
        segments={segments}
        onSelectSegment={mode === 'admin' ? handleSelectSegment : undefined}
        onCreateSegment={mode === 'admin' ? handleCreateSegment : undefined}
        selectedIndex={mode === 'admin' ? selectedIndex : null}
        showMediaPopup={mode === 'public'}
      />
      <StatsBar segments={segments} />
      <Legend />
      {mode === 'admin' ? (
        <>
          <div className="admin-badge">Modo administracion</div>
          <AdminPanel
            segment={selectedSegment}
            onChangeSegment={handleSegmentChange}
            onDelete={handleDeleteSegment}
            onExport={handleExport}
            focusToken={focusToken}
            isNewSegment={selectedIndex !== null && selectedIndex === newSegmentIndex}
          />
        </>
      ) : null}
    </div>
  )
}
