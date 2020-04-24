export type METADATA = {[key: string]: any}

export interface People<LOC> {
  name: string;
  imgURL: string;
  phoning: boolean;
  metadata: METADATA;
  location: LOC;
}

export interface Device {
  name: string;
  imgURL?: string;
  metadata: METADATA;
}

export interface SceneLocation {
  metadata: METADATA;
  color?: string;
  border?: string;
  imgURL?: string;
}
