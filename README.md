# Paysandu Calles

Frontend simple en React + Vite + TypeScript para visualizar tramos de calles de Paysandu sobre OpenStreetMap.

## Requisitos

- Node.js 18+ (recomendado)
- npm

## Como correr el proyecto

```bash
npm install
npm run dev
```

Vite mostrara la URL local en la consola (por ejemplo, `http://localhost:5173`).

## Datos de calles

El archivo local se encuentra en `public/data/calles.json` y tiene esta estructura:

```json
[
  {
    "calle": "Ejemplo",
    "desde": "Calle A",
    "hasta": "Calle B",
    "estado": "rojo",
    "coords": [
      [-32.321, -58.079],
      [-32.322, -58.078]
    ]
  }
]
```

Los estados posibles son: `verde`, `amarillo`, `rojo`.

## Modos de la aplicacion

- Modo publico (default): solo visualizacion, muestra la leyenda y el detalle de cada tramo al hacer click.
- Modo admin: habilita edicion local del estado, dibujo de tramos y exportacion de JSON.

### Como acceder al modo admin

- URL con query param: `/?admin=true`
- Ruta dedicada: `/admin`

La edicion es curada y local para evitar cambios abiertos: no hay backend ni autenticacion, y los cambios
solo viven en memoria hasta que se exporta el JSON actualizado.

En modo admin, el boton de dibujo permite crear un nuevo tramo con valores por defecto y seleccionarlo
para editar su estado.

## Mapa y navegacion

- Zoom minimo 13 y zoom maximo 18 para mantener el foco en la ciudad.
- El mapa queda limitado a un bounding box aproximado de Paysandu para evitar salir del area.
- Al hacer hover o click sobre un tramo, se muestra el nombre de la calle, estado y tramo.
- Los tramos se dibujan con estilo marcador (opacidad moderada y bordes redondeados).
- Hay un resumen fijo con total y porcentajes por estado.
