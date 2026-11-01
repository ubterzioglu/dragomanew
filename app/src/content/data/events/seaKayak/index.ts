import type { DragomanEvent } from '../../../schema'
import { isikKiyisi } from './isikKiyisi'
import { kariaKiyisi } from './kariaKiyisi'
import { kekovaBati } from './kekovaBati'
import { kekovaDogu } from './kekovaDogu'
import { kekovaKayakGulet } from './kekovaKayakGulet'
import { kekovaKlasik } from './kekovaKlasik'
import { kekovaKorfezi } from './kekovaKorfezi'
import { likyaKayakKonfor } from './likyaKayakKonfor'
import { trakSignature } from './trakSignature'

/**
 * The agreed sea kayak inventory (9 records). dragomanseakayak.com is the primary
 * source; the old cloner page only fills gaps. Health forms are not used for kayaking.
 */
export const seaKayakEvents: DragomanEvent[] = [
  kekovaKlasik,
  kekovaBati,
  kekovaDogu,
  kekovaKorfezi,
  isikKiyisi,
  kekovaKayakGulet,
  likyaKayakKonfor,
  kariaKiyisi,
  trakSignature,
]
