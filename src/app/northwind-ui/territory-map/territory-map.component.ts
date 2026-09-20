import { Component, inject, ViewChild } from '@angular/core';
import { Observable, map, tap } from 'rxjs';
import { GoogleMap, MapMarker, MapInfoWindow } from '@angular/google-maps';
import { EmployeeTerritoryMap, TerritoryMap } from '../../utilities/models/employee-territory-map';
import { EmployeeTerritoryMapService } from '../../utilities/services/employee-territory-details/employee-territory-map.service';
import { AsyncPipe } from '@angular/common';

interface TerritoryMarker {
  employeeId: number | null;
  territoryId: string;
  city: string;
  regionDescription: string;
  position: google.maps.LatLngLiteral;
  options: google.maps.MarkerOptions;
  employeeName: string | null;
  employeeTitle: string | null;
}

const REGION_COLORS: Record<number, string> = {
  1: '#4C6EF5', // Eastern
  2: '#F76707', // Western
  3: '#37B24D', // Northern
  4: '#E64980', // Southern
};
const UNASSIGNED_COLOR = '#868E96';

@Component({
  selector: 'app-territory-map',
  imports: [AsyncPipe, GoogleMap, MapMarker, MapInfoWindow],
  templateUrl: './territory-map.component.html',
  styleUrl: './territory-map.component.scss',
})
export class TerritoryMapComponent {
 private _service = inject(EmployeeTerritoryMapService);

  center: google.maps.LatLngLiteral = { lat: 39.5, lng: -98.35 };
  zoom = 4;

  selectedMarker: TerritoryMarker | null = null;
  employees: EmployeeTerritoryMap[] = [];
  @ViewChild(GoogleMap) map!: GoogleMap;
  selectedEmployeeId: number | null = null;
  markers: TerritoryMarker[] = [];

  mapOptions: google.maps.MapOptions = {
    styles: [
      { stylers: [{ saturation: -100 }, { lightness: 10 }] }
    ]
  };

markers$: Observable<TerritoryMarker[]> = this._service.getEmployeeTerritoryMap().pipe(
  map(groups => this.buildMarkers(groups)),
  tap(markers => {
    const { center, zoom } = this.computeCenterAndZoom(markers);
    this.center = center;
    this.zoom = zoom;
  })
);

private computeCenterAndZoom(markers: TerritoryMarker[]): { center: google.maps.LatLngLiteral, zoom: number } {
  if (markers.length === 0) {
    return { center: { lat: 39.5, lng: -98.35 }, zoom: 4 };
  }

  const dense = this.findDensestCluster(markers, 80); // 80-mile radius

  const lats = dense.map(m => m.position.lat);
  const lngs = dense.map(m => m.position.lng);
  const center = {
    lat: (Math.min(...lats) + Math.max(...lats)) / 2,
    lng: (Math.min(...lngs) + Math.max(...lngs)) / 2
  };

  const maxSpan = Math.max(Math.max(...lats) - Math.min(...lats), Math.max(...lngs) - Math.min(...lngs));

  let zoom = 10;
  if (maxSpan < 0.05) zoom = 13;
  else if (maxSpan < 0.15) zoom = 11;
  else if (maxSpan < 0.5) zoom = 9;
  else if (maxSpan < 1.5) zoom = 7;
  else zoom = 5;

  return { center, zoom };
  }

  private findDensestCluster(markers: TerritoryMarker[], radiusMiles: number): TerritoryMarker[] {
    let best: TerritoryMarker[] = [markers[0]];
    for (const candidate of markers) {
      const neighbors = markers.filter(m => this.haversineMiles(candidate.position, m.position) <= radiusMiles);
      if (neighbors.length > best.length) {
        best = neighbors;
      }
    }
    return best;
  }

  private haversineMiles(a: google.maps.LatLngLiteral, b: google.maps.LatLngLiteral): number {
    const toRad = (deg: number) => deg * Math.PI / 180;
    const R = 3958.8;
    const dLat = toRad(b.lat - a.lat);
    const dLng = toRad(b.lng - a.lng);
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  }

  onMarkerClick(marker: TerritoryMarker, markerRef: MapMarker, info: MapInfoWindow): void {
    this.selectedMarker = marker;
    info.open(markerRef);
  }

private buildMarkers(groups: EmployeeTerritoryMap[]): TerritoryMarker[] {
  const markers: TerritoryMarker[] = [];

  for (const group of groups) {
    for (const t of group.territories) {
      if (t.latitude == null || t.longitude == null) continue;

      const color = group.employeeId ? (REGION_COLORS[t.regionId] ?? '#333333') : UNASSIGNED_COLOR;

      markers.push({
        employeeId: group.employeeId,
        territoryId: t.territoryId,
        city: t.territoryDescription,
        regionDescription: t.regionDescription,
        position: { lat: t.latitude, lng: t.longitude },
        options: {
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            fillColor: color,
            fillOpacity: 0.9,
            strokeColor: '#ffffff',
            strokeWeight: 2,
            scale: 8
          }
        },
        employeeName: group.employeeId ? `${group.firstName} ${group.lastName}` : null,
        employeeTitle: group.title
      });
    }
  }

  this.markers = markers;   // replace, never append
  this.buildEmployeesTable(groups);
  return this.markers;
}


  private buildEmployeesTable(groups: EmployeeTerritoryMap[]): void {
    this.employees = groups.map(group => ({
      employeeId: group.employeeId,
      firstName: group.firstName,
      lastName: group.lastName,
      title: group.title,
      photoPath: group.photoPath,
      territories:group.territories
    }));

    console.log(this.employees, '---employeez')
    
  }

  focusEmployeeOnMap(employeeId: number| null): void {
    const emp = this.employees.find(e => e.employeeId === employeeId);
    if (!emp) return;

    emp.expanded = !emp.expanded;
    this.selectedEmployeeId = employeeId;

    const employeeMarkers = this.markers.filter(m => m.employeeId === employeeId);
    if (!employeeMarkers.length || !this.map?.googleMap) return;

    if (employeeMarkers.length === 1) {
      this.map.googleMap.panTo(employeeMarkers[0].position);
      this.map.googleMap.setZoom(12);
      this.map.googleMap?.setMapTypeId('roadmap');
    } else {
      const bounds = new google.maps.LatLngBounds();
      employeeMarkers.forEach(m => bounds.extend(m.position));
      this.map.googleMap.fitBounds(bounds);
    }
  }

  focusTerritoryOnMap(territory: TerritoryMap, event: Event) {
    event.stopPropagation(); // prevent the row's expand/collapse click from also firing

    if (territory.latitude == null || territory.longitude == null) {
      return; // no valid coordinates to zoom to
    }

    const position: google.maps.LatLngLiteral = { 
      lat: territory.latitude, 
      lng: territory.longitude 
    };

    this.map.googleMap?.panTo(position);
    this.map.googleMap?.setZoom(19);
    this.map.googleMap?.setMapTypeId('roadmap');
  }  
}
