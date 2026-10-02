import type { Assessment } from '@/types';

/** Achata uma avaliação nos nomes de campo usados pelo formulário (strings). */
export function assessmentToFields(a: Assessment): Record<string, string> {
  const s = (v: number | string | null | undefined) => (v === null || v === undefined ? '' : String(v));
  const c = a.circunferencias;
  return {
    data: a.data.toISOString().slice(0, 10),
    altura: s(a.altura), peso: s(a.peso),
    circOmbro: s(c.ombro), circTorax: s(c.torax), circCintura: s(c.cintura), circAbdominal: s(c.abdominal), circQuadril: s(c.quadril),
    circBracoNormalEsq: s(c.bracoNormal.esquerdo), circBracoNormalDir: s(c.bracoNormal.direito),
    circBracoContraidoEsq: s(c.bracoContraido.esquerdo), circBracoContraidoDir: s(c.bracoContraido.direito),
    circAntebracoEsq: s(c.antebraco.esquerdo), circAntebracoDir: s(c.antebraco.direito),
    circCoxaEsq: s(c.coxa.esquerdo), circCoxaDir: s(c.coxa.direito),
    circPanturrilhaEsq: s(c.panturrilha.esquerdo), circPanturrilhaDir: s(c.panturrilha.direito),
    dobraTriceps: s(a.dobras.triceps), dobraPeito: s(a.dobras.peito), dobraAxilarMedia: s(a.dobras.axilarMedia),
    dobraSubescapular: s(a.dobras.subescapular), dobraAbdominal: s(a.dobras.abdominal),
    dobraSupraIliaca: s(a.dobras.supraIliaca), dobraCoxa: s(a.dobras.coxa),
    fotoAnterior: s(a.fotos.anterior), fotoPosterior: s(a.fotos.posterior),
    fotoLadoEsquerdo: s(a.fotos.ladoEsquerdo), fotoLadoDireito: s(a.fotos.ladoDireito),
    observacoes: s(a.observacoes),
  };
}
