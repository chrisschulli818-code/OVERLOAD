'use client';

import { useActionState, useMemo, useState } from 'react';
import { createAssessment, updateAssessment, type FormState } from '@/app/actions';
import { Field, FormMessage } from '@/components/FormParts';
import { ImcBadge } from '@/components/ImcBadge';
import { assessmentToFields } from '@/lib/assessmentFields';
import type { Assessment, DobrasCutaneas, Sexo } from '@/types';
import { calcularAvaliacao } from '@/utils/calculations';

const num = (v: string): number | null => {
  const n = parseFloat(v.replace(',', '.'));
  return Number.isFinite(n) ? n : null;
};

const CIRC: [string, string][] = [['circOmbro', 'Ombro'], ['circTorax', 'Tórax'], ['circCintura', 'Cintura'], ['circAbdominal', 'Abdominal'], ['circQuadril', 'Quadril']];
const CIRC_LR: [string, string][] = [['circBracoNormal', 'Braço normal'], ['circBracoContraido', 'Braço contraído'], ['circAntebraco', 'Antebraço'], ['circCoxa', 'Coxa'], ['circPanturrilha', 'Panturrilha']];
const DOBRAS: [keyof DobrasCutaneas, string][] = [
  ['triceps', 'Tríceps'], ['peito', 'Peito'], ['axilarMedia', 'Axilar média'], ['subescapular', 'Subescapular'],
  ['abdominal', 'Abdominal'], ['supraIliaca', 'Supra-ilíaca'], ['coxa', 'Coxa'],
];
const dobraName = (k: string) => 'dobra' + k[0].toUpperCase() + k.slice(1);
const FOTOS: [string, string][] = [['fotoAnterior', 'Anterior'], ['fotoPosterior', 'Posterior'], ['fotoLadoEsquerdo', 'Lado esquerdo'], ['fotoLadoDireito', 'Lado direito']];

export function AssessmentForm({
  studentId, sexo, idade, initial,
}: { studentId: string; sexo: Sexo; idade: number; initial?: Assessment }) {
  const f = initial ? assessmentToFields(initial) : {};
  const [state, action, pending] = useActionState<FormState, FormData>(
    initial ? updateAssessment.bind(null, studentId, initial.id) : createAssessment.bind(null, studentId),
    {},
  );
  const err = state.errors ?? {};
  const [altura, setAltura] = useState(f.altura ?? '');
  const [peso, setPeso] = useState(f.peso ?? '');
  const [dobras, setDobras] = useState<Record<string, string>>(
    Object.fromEntries(DOBRAS.map(([k]) => [k, f[dobraName(k)] ?? ''])),
  );

  const r = useMemo(
    () =>
      calcularAvaliacao({
        altura: num(altura), peso: num(peso), sexo, idade,
        dobras: Object.fromEntries(DOBRAS.map(([k]) => [k, num(dobras[k] ?? '')])) as unknown as DobrasCutaneas,
      }),
    [altura, peso, dobras, sexo, idade],
  );

  return (
    <form action={action} className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-6">
        <section className="card grid gap-4 sm:grid-cols-3">
          <Field label="Data da avaliação *" error={err.data}><input name="data" type="date" defaultValue={f.data} required className="input" /></Field>
          <Field label="Altura (m)" error={err.altura}><input name="altura" inputMode="decimal" className="input" placeholder="1,75" value={altura} onChange={(e) => setAltura(e.target.value)} /></Field>
          <Field label="Peso (kg)" error={err.peso}><input name="peso" inputMode="decimal" className="input" placeholder="70,0" value={peso} onChange={(e) => setPeso(e.target.value)} /></Field>
        </section>

        <section className="card">
          <h2 className="mb-3 font-semibold">Circunferências (cm)</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            {CIRC.map(([k, c]) => <Field key={k} label={c} error={err[k]}><input name={k} defaultValue={f[k]} inputMode="decimal" className="input" /></Field>)}
          </div>
          <div className="mt-4 space-y-3">
            {CIRC_LR.map(([k, c]) => (
              <div key={k} className="grid grid-cols-[1fr_1fr_1fr] items-end gap-3 sm:max-w-md">
                <span className="pb-2 text-sm font-medium">{c}</span>
                <Field label="Esq." error={err[k + 'Esq']}><input name={k + 'Esq'} defaultValue={f[k + 'Esq']} inputMode="decimal" className="input" /></Field>
                <Field label="Dir." error={err[k + 'Dir']}><input name={k + 'Dir'} defaultValue={f[k + 'Dir']} inputMode="decimal" className="input" /></Field>
              </div>
            ))}
          </div>
        </section>

        <section className="card">
          <h2 className="mb-1 font-semibold">Dobras cutâneas (mm)</h2>
          <p className="mb-3 text-xs text-muted">Protocolo Pollock 7 dobras — preencha todas para calcular o % de gordura.</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {DOBRAS.map(([k, label]) => (
              <Field key={k} label={label} error={err[dobraName(k)]}>
                <input name={dobraName(k)} inputMode="decimal" className="input" value={dobras[k] ?? ''} onChange={(e) => setDobras({ ...dobras, [k]: e.target.value })} />
              </Field>
            ))}
          </div>
        </section>

        <section className="card">
          <h2 className="mb-1 font-semibold">Fotos</h2>
          <p className="mb-3 text-xs text-muted">Cole o link (URL) de cada foto.</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {FOTOS.map(([k, foto]) => (
              <Field key={k} label={foto} error={err[k]}><input name={k} defaultValue={f[k]} type="url" placeholder="https://…" className="input" /></Field>
            ))}
          </div>
        </section>

        <section className="card">
          <Field label="Observações"><textarea name="observacoes" defaultValue={f.observacoes} rows={4} className="input" /></Field>
        </section>
      </div>

      <aside className="lg:sticky lg:top-20 lg:self-start">
        <div className="card space-y-4">
          <h2 className="font-semibold">Resultado</h2>
          <div>
            <p className="text-xs text-muted">IMC</p>
            <p className="text-3xl font-bold">{r.imc ?? '—'}</p>
            <ImcBadge value={r.classificacaoImc} />
          </div>
          <dl className="grid grid-cols-3 gap-2 border-t border-border pt-4 text-sm">
            <div><dt className="text-xs text-muted">% Gordura</dt><dd className="font-bold">{r.percentualGordura ?? '—'}</dd></div>
            <div><dt className="text-xs text-muted">M. gorda</dt><dd className="font-bold">{r.massaGorda ?? '—'}</dd></div>
            <div><dt className="text-xs text-muted">M. magra</dt><dd className="font-bold">{r.massaMagra ?? '—'}</dd></div>
          </dl>
          <FormMessage state={state} />
          <button className="btn w-full disabled:opacity-60" type="submit" disabled={pending}>{pending ? 'Salvando…' : initial ? 'Salvar alterações' : 'Salvar avaliação'}</button>
        </div>
      </aside>
    </form>
  );
}
