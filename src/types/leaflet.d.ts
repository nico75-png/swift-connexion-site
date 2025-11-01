declare module "leaflet" {
  export type LatLngExpression = [number, number] | { lat: number; lng: number };
  
  export interface Polyline {
    addTo(map: Map): this;
    setLatLngs(latlngs: LatLngExpression[]): this;
    getElement?: () => SVGElement | null;
  }
  
  export interface Marker {
    addTo(map: Map): this;
    setLatLng(latlng: LatLngExpression): this;
    setIcon(icon: unknown): this;
    bindTooltip?: (content: string, options?: Record<string, unknown>) => this;
  }
  
  export interface Map {
    remove(): void;
    fitBounds(bounds: unknown, options?: Record<string, unknown>): this;
    setView(center: LatLngExpression, zoom: number, options?: Record<string, unknown>): this;
    getZoom?: () => number;
  }
  
  export interface TileLayer {
    addTo(map: Map): this;
    on?: (event: string, handler: () => void) => this;
  }
  
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
