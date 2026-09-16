export interface TerritoryMap {
  territoryId: string;
  territoryDescription: string;
  latitude: number | null;
  longitude: number | null;
  regionId: number;
  regionDescription: string;
}

export interface EmployeeTerritoryMap {
  employeeId: number | null;
  firstName: string | null;
  lastName: string | null;
  title: string | null;
  photoPath: string | null;
  territories: TerritoryMap[];
  expanded?:boolean;
}