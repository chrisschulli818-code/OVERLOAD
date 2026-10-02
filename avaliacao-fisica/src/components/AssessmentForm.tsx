'use client';

import { useMemo, useState } from 'react';
import { ImcBadge } from '@/components/ImcBadge';
import type { DobrasCutaneas, Sexo } from '@/types';
import { calcularAvaliacao } from '@/utils/calculations';

const num = (v: string): number | null => {
  const n = parseFloat(v.replace(',', '.'));
  return Number.isFinite(n) ? n : null;
};

const CIRC = ['Ombro', 'Tórax', 'Cintura', 'Abdominal', 'Quadril'];
const CIRC_LR = ['Braço normal', 'Braço contraído', 'Antebraço', 'Coxa', 'Panturrilha'];
const DOBRAS: [keyof DobrasCutaneas, string][] = [
  ['triceps', 'Tríceps'], ['peito', 'Peito'], ['axilarMedia', 'Axilar média'], ['subescapular', 'Subescapular'],
  ['abdominal', 'Abdominal'], ['supraIliaca', 'Supra-ilíaca'], ['coxa', 'Coxa'],
];
const FOTOS = ['Anterior', 'Posterior', 'Lado esquerdo', 'Lado direito'];

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1">
      <span className="text-xs font-medium text-muted">{label}</span>
      {children}
    </label>
  );
}

export function AssessmentForm({ sexo, idade }: { sexo: Sexo; idade: number }) {
  const [altura, setAltura] = useState('');
  const [peso, setPeso] = useState('');
  const [dobras, setDobras] = useState<Record<string, string>>({});

  const r = useMemo(
    () =>
      calcularAvaliacao({
        altura: num(altura), peso: num(peso), sexo, idade,
        dobras: Object.fromEntries(DOBRAS.map(([k]) => [k, num(dobras[k] ?? '')])) as unknown as DobrasCutaneas,
      }),
    [altura, peso, dobras, sexo, idade],
  );

  return (
    <form className="grid gap-6 lg:grid-cols-[1fr_320px]" onSubmit={(e) => e.preventDefault()}>
      <div className="space-y-6">
        <section className="card grid gap-4 sm:grid-cols-3">
          <Field label="Data da avaliação *"><input type="date" required className="input" /></Field>
          <Field label="Altura (m)"><input inputMode="decimal" className="input" placeholder="1,75" value={altura} onChange={(e) => setAltura(e.target.value)} /></Field>
          <Field label="Peso (kg)"><input inputMode="decimal" className="input" placeholder="70,0" value={peso} onChange={(e) => setPeso(e.target.value)} /></Field>
        </section>

        <section className="card">
          <h2 className="mb-3 font-semibold">Circunferências (cm)</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            {CIRC.map((c) => <Field key={c} label={c}><input inputMode="decimal" className="input" /></Field>)}
          </div>
          <div className="mt-4 space-y-3">
            {CIRC_LR.map((c) => (
              <div key={c} className="grid grid-cols-[1fr_1fr_1fr] items-end gap-3 sm:max-w-md">
                <span className="pb-2 text-sm font-medium">{c}</span>
                <Field label="Esq."><input inputMode="decimal" className="input" /></Field>
                <Field label="Dir."><input inputMode="decimal" className="input" /></Field>
              </div>
            ))}
          </div>
        </section>

        <section className="card">
          <h2 className="mb-1 font-semibold">Dobras cutâneas (mm)</h2>
          <p className="mb-3 text-xs text-muted">Protocolo Pollock 7 dobras — preencha todas para calcular o % de gordura.</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {DOBRAS.map(([k, label]) => (
              <Field key={k} label={label}>
                <input inputMode="decimal" className="input" value={dobras[k] ?? ''} onChange={(e) => setDobras({ ...dobras, [k]: e.target.value })} />
              </Field>
            ))}
          </div>
        </section>

        <section className="card">
          <h2 className="mb-3 font-semibold">Fotos</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {FOTOS.map((f) => (
              <div key={f} className="grid aspect-[3/4] place-items-center rounded-xl border border-dashed border-border text-center text-xs text-muted">
                <span>+ {f}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="card">
          <Field label="Observações"><textarea rows={4} className="input" /></Field>
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
          <button className="btn w-full" type="submit">Salvar avaliação</button>
        </div>
      </aside>
    </form>
  );
}
