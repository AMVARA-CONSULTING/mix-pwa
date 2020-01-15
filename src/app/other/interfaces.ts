
export enum EventType {
  RUBRIK = 'rubrik',
  ADDRESS_NAME = 'adressname',
  UHRZEIT = 'uhrzeit',
  TITLE = 'titel'
}

export interface Banner {
  alt: string
  bild: string
  key: number
  rubrik: string
  url: string
}

export interface GenericInfo {
  aufgeben_form_status: boolean
  show_termin_coupon_hinweis_alert: boolean
  termin_coupon_hinweis_text: string
  show_kaz_coupon_hinweis_alert: boolean
  kaz_coupon_hinweis_text: string
  info_box: string
  info_box_enable: boolean
  mandatid: string
  rubriks: RubrikTitle[]
  wann_items: WannItem[]
  clearStorage: boolean
  clearStorageTimestamp: string
  version: string
  ticket?: Ticket
}

export interface Ticket {
  url: string
  available?: boolean
}

export interface WannItem {
  translate: string
  value: string
}

export interface RubrikTitle {
  rubrik: string
  rubrik_order: number
  total_events: number
  exceeds: boolean
}

export interface EventsReponse {
  grouped: boolean
  rows: Event[]
  success: boolean
  rubriks?: RubrikTitle[]
  error_code?: string
  extended_search: boolean
  extended_search_downgraded_filter?: 'time' | 'rubrik' | 'both'
}

export interface ISuccess {
  success: boolean
}

export interface Event {
  adress_beschreibung: string
  adressname: string
  updatedOn: string
  datum_humanized: string
  title_cut_to_40: string
  assistants: number
  assists?: number
  related_events?: Event[]
  box_type?: string
  beschreibung: string
  bildfassung: string
  buch: string
  copyright: string
  darsteller: string
  datum: string
  events_count?: number
  email: string
  eventid: string
  filmlaenge: number
  flag: string
  fsk: number
  genre: string
  hash: string
  homepage: string
  image_name: string
  images: any[]
  kamera: string
  land: string
  missing_verort: any
  or_verort: any
  originaltitel: string
  orteid: string
  plakate_org: string
  plzort: string
  produzent: string
  regie: string
  region: string
  rubrik: string
  sessionid: any
  sprachfassung: string
  strasse: string
  telefax: string
  telefon: string
  titel: string
  titel_formatted_pipe: string
  titel_sanitized: string
  totalImages: number
  trailer: any
  trailerurl: string
  uhrzeit: string
  umland: string
  verort: string
  zeitbis: any
  zeitvon: any
  homepage_prefixed: string
  tickets?: ProviderTicket[]
}

export interface ProviderTicket {
  provider: string
  id: string | number
  data: ProviderTicketData
}

export interface ProviderTicketData {
  url?: string
}

export interface CaptchaResponse {
  required: boolean
}

export interface KinoRelatedDate {
  adressname: string
  datum: string
  homepage: string
  plzort: string
  region: string
  strasse: string
  telefon: string
  uhrzeit: string
}

export interface Print {
  name: string
  pages: number
}

export interface ConfigInfo {
  version: string
  scenario: string
  languages: any
  language: string
  changelog: Version[]
}

export interface Version {
  version: string
  text: string[]
}

export interface EventProvider {
  provider: string,
  id: string
  url?: string
}