declare module "leaflet" {
  export type LatLngExpression = [number, number] | { lat: number; lng: number };
  export type Polyline = any;
  export type Marker = any;
  export type Map = any;
  export type TileLayer = any;
  export interface MapOptions {
    zoom?: number;
    center?: LatLngExpression;
    zoomControl?: boolean;
    scrollWheelZoom?: boolean | string;
    dragging?: boolean;
  }
  export interface TileLayerOptions {
    attribution?: string;
    maxZoom?: number;
  }
  export const map: (element: HTMLElement, options?: MapOptions) => Map;
  export const tileLayer: (urlTemplate: string, options?: TileLayerOptions) => TileLayer;
  export const polyline: (latlngs: LatLngExpression[], options?: Record<string, unknown>) => Polyline;
  export const marker: (latlng: LatLngExpression, options?: Record<string, unknown>) => Marker;
  export const divIcon: (options: Record<string, unknown>) => unknown;
  export const icon: (options: Record<string, unknown>) => unknown;
  export const latLngBounds: (latlngs: LatLngExpression[]) => { pad: (ratio: number) => { getCenter: () => LatLngExpression }; };
}
