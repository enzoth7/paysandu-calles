import { useCallback, useEffect, useState } from 'react'
import L, { type LatLngBoundsExpression } from 'leaflet'
import 'leaflet-draw'
import {
  MapContainer,
  Polyline,
  Popup,
  TileLayer,
  Tooltip,
  useMap,
  useMapEvents,
} from 'react-leaflet'
import type { CalleSegment, Estado } from '../types'

const STATUS_COLORS: Record<Estado, string> = {
  verde: '#2ecc71',
  amarillo: '#f1c40f',
  rojo: '#e74c3c',
}

const MAP_CENTER: [number, number] = [-32.317, -58.08]
// Approximate bounding box to keep navigation inside Paysandu.
const PAYSANDU_BOUNDS: LatLngBoundsExpression = [
  [-32.38, -58.14],
  [-32.26, -57.98],
]
const ZOOM_MIN = 13
const ZOOM_MAX = 18

const getLineWeight = (zoom: number) => {
  const weight = Math.round(zoom - 9)
  return Math.max(4, Math.min(8, weight))
}

type SegmentInfoProps = {
  segment: CalleSegment
}

function SegmentInfo({ segment }: SegmentInfoProps) {
  return (
    <div className="street-info">
      <div className="street-info-title">{segment.calle}</div>
      <div className="street-info-row">Estado: {segment.estado}</div>
      <div className="street-info-row">Desde: {segment.desde}</div>
      <div className="street-info-row">Hasta: {segment.hasta}</div>
    </div>
  )
}

type SegmentPopupProps = {
  segment: CalleSegment
  showMedia: boolean
}

function SegmentPopup({ segment, showMedia }: SegmentPopupProps) {
  const isPhotoEligible = showMedia && segment.estado !== 'verde'
  const [imageError, setImageError] = useState(false)

  useEffect(() => {
    setImageError(false)
  }, [segment.fotoUrl])

  return (
    <div className="street-popup-content">
      <div className="street-popup-title">{segment.calle}</div>
      <div className="street-popup-id">ID: {segment.id}</div>
      <div className="street-popup-row">Estado: {segment.estado}</div>
      <div className="street-popup-subtitle">
        {segment.desde} - {segment.hasta}
      </div>
      {segment.nota ? <div className="street-popup-note">{segment.nota}</div> : null}
      {isPhotoEligible ? (
        segment.fotoUrl ? (
          imageError ? (
            <div className="street-popup-error">No se pudo cargar la foto</div>
          ) : (
            <img
              className="street-popup-image"
              src={segment.fotoUrl}
              alt={`Foto del tramo ${segment.calle}`}
              loading="lazy"
              onError={() => setImageError(true)}
            />
          )
        ) : (
          <div className="street-popup-empty">Sin foto aun</div>
        )
      ) : null}
    </div>
  )
}

type ZoomWatcherProps = {
  onZoomChange: (zoom: number) => void
}

function ZoomWatcher({ onZoomChange }: ZoomWatcherProps) {
  const map = useMapEvents({
    zoomend: () => {
      onZoomChange(map.getZoom())
    },
  })

  useEffect(() => {
    onZoomChange(map.getZoom())
  }, [map, onZoomChange])

  return null
}

type MapViewProps = {
  segments: CalleSegment[]
  onSelectSegment?: (index: number) => void
  onCreateSegment?: (coords: [number, number][]) => void
  selectedIndex?: number | null
  showMediaPopup?: boolean
}

type DrawControlProps = {
  onCreateSegment: (coords: [number, number][]) => void
}

function DrawControl({ onCreateSegment }: DrawControlProps) {
  const map = useMap()

  useEffect(() => {
    const drawnItems = new L.FeatureGroup()
    map.addLayer(drawnItems)

    const drawControl = new L.Control.Draw({
      position: 'topleft',
      draw: {
        polyline: {
          shapeOptions: {
            color: '#f1c40f',
            weight: 4,
            opacity: 0.9,
          },
        },
        polygon: false,
        rectangle: false,
        circle: false,
        circlemarker: false,
        marker: false,
      },
      edit: {
        featureGroup: drawnItems,
        edit: false,
        remove: false,
      },
    })

    map.addControl(drawControl)

    const handleCreated = (event: L.LeafletEvent) => {
      const drawEvent = event as L.DrawEvents.Created
      if (drawEvent.layerType !== 'polyline') {
        return
      }

      const layer = drawEvent.layer as L.Polyline
      drawnItems.addLayer(layer)
      const latlngs = layer.getLatLngs() as L.LatLng[]
      const coords = latlngs.map((point) => [point.lat, point.lng] as [number, number])

      if (coords.length > 1) {
        onCreateSegment(coords)
      }

      drawnItems.removeLayer(layer)
    }

    map.on(L.Draw.Event.CREATED, handleCreated)

    return () => {
      map.off(L.Draw.Event.CREATED, handleCreated)
      map.removeControl(drawControl)
      map.removeLayer(drawnItems)
    }
  }, [map, onCreateSegment])

  return null
}

export function MapView({
  segments,
  onSelectSegment,
  onCreateSegment,
  selectedIndex = null,
  showMediaPopup = false,
}: MapViewProps) {
  const [lineWeight, setLineWeight] = useState(() => getLineWeight(ZOOM_MIN))
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  const handleZoomChange = useCallback((zoom: number) => {
    setLineWeight(getLineWeight(zoom))
  }, [])

  return (
    <MapContainer
      center={MAP_CENTER}
      zoom={ZOOM_MIN}
      minZoom={ZOOM_MIN}
      maxZoom={ZOOM_MAX}
      maxBounds={PAYSANDU_BOUNDS}
      maxBoundsViscosity={1}
      className="map"
      scrollWheelZoom
    >
      <ZoomWatcher onZoomChange={handleZoomChange} />
      {onCreateSegment ? <DrawControl onCreateSegment={onCreateSegment} /> : null}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {segments.map((segment, index) => {
        const isSelected = selectedIndex === index
        const isHovered = hoveredIndex === index
        const baseWeight = Math.min(lineWeight + 2, 12)

        let weight = baseWeight
        let opacity = 0.55

        if (isSelected) {
          weight = Math.min(weight + 3, 16)
          opacity = 0.8
        }

        if (isHovered) {
          weight = Math.min(weight + 2, 18)
          opacity = Math.max(opacity, 0.9)
        }

        const eventHandlers: L.LeafletEventHandlerFnMap = {
          mouseover: () => setHoveredIndex(index),
          mouseout: () =>
            setHoveredIndex((current) => (current === index ? null : current)),
        }

        if (onSelectSegment) {
          eventHandlers.click = () => onSelectSegment(index)
        }

        return (
          <Polyline
            key={segment.id}
            positions={segment.coords}
            pathOptions={{
              color: STATUS_COLORS[segment.estado],
              weight,
              opacity,
              lineCap: 'round',
              lineJoin: 'round',
            }}
            eventHandlers={eventHandlers}
          >
            <Tooltip sticky className="street-tooltip">
              <SegmentInfo segment={segment} />
            </Tooltip>
            <Popup className="street-popup">
              <SegmentPopup segment={segment} showMedia={showMediaPopup} />
            </Popup>
          </Polyline>
        )
      })}
    </MapContainer>
  )
}
