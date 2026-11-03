import type { DragomanEvent } from '../../../schema'
import { geceDalisi, ozelDalisDragomanJunior, sharmElSheikh2026, tekneDalislari } from './certified'
import { beceriTazeleme, denemeDalisi, ssiAdvancedOpenWaterDiver, ssiDiverStressAndRescue, ssiDivemaster, ssiOpenWaterDiver, ssiUzmanlikKurslari } from './training'

/** Diving events from the old diving page (cloner). All use the diving health form. */
export const divingEvents: DragomanEvent[] = [
  denemeDalisi,
  tekneDalislari,
  geceDalisi,
  ozelDalisDragomanJunior,
  sharmElSheikh2026,
  beceriTazeleme,
  ssiOpenWaterDiver,
  ssiUzmanlikKurslari,
  ssiAdvancedOpenWaterDiver,
  ssiDiverStressAndRescue,
  ssiDivemaster,
]
