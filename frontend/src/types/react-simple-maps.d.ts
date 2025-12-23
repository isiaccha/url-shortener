declare module 'react-simple-maps' {
  export interface Geography {
    rsmKey: string
    properties: Record<string, any>
    geometry: any
  }

  export interface GeographiesProps {
    geography: string | object
    children: (props: { geographies: Geography[] }) => React.ReactNode
  }

  export interface GeographyProps {
    geography: Geography
    fill?: string
    stroke?: string
    strokeWidth?: number
    style?: {
      default?: React.CSSProperties
      hover?: React.CSSProperties
      pressed?: React.CSSProperties
    }
    onMouseEnter?: () => void
  }

  export interface ComposableMapProps {
    projectionConfig?: {
      scale?: number
      center?: [number, number]
    }
    style?: React.CSSProperties
    children: React.ReactNode
  }

  export const ComposableMap: React.FC<ComposableMapProps>
  export const Geographies: React.FC<GeographiesProps>
  export const Geography: React.FC<GeographyProps>
}

