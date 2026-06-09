export interface Album {
  id: string;
  slug: string;
  titel: string;
  datum: string;
  volgorde: number;
}

export interface Foto {
  id: string;
  album_id: string;
  r2_key: string;
  impressies: boolean;
  volgorde: number;
}
