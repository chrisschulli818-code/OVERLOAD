'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { createStudent, updateStudent, type FormState } from '@/app/actions';
import { Field, FormMessage } from '@/components/FormParts';
import type { Student } from '@/types';

/** Perguntas sim/não com campo opcional de detalhe. */
const YES_NO_DETAIL: [string, string, string, string][] = [
  ['temDoencaOuProblemaSaude', 'doencaOuProblemaSaudeDetalhe', 'Doença/problema de saúde?', 'Qual?'],
  ['temLimitacaoMovimento', 'limitacaoMovimentoDetalhe', 'Limitação de movimento?', 'Qual?'],
  ['temDorEmMovimento', 'dorEmMovimentoDetalhe', 'Dor em algum movimento?', 'Qual movimento?'],
  ['fezCirurgias', 'cirurgiasDetalhe', 'Cirurgias?', 'Quais?'],
  ['usaMedicamentoControlado', 'medicamentoControladoDetalhe', 'Medicamento controlado?', 'Qual?'],
];
const YES_NO: [string, string][] = [
  ['jaTreinouAntes', 'Já treinou antes?'],
  ['estaFazendoDieta', 'Está fazendo dieta?'],
  ['consomeAlcool', 'Consome álcool?'],
  ['fuma', 'Fuma?'],
];

function Check({ name, label, checked }: { name: string; label: string; checked?: boolean }) {
  return (
    <label className="flex items-center gap-2 text-sm font-medium">
      <input type="checkbox" name={name} defaultChecked={checked} className="h-4 w-4 accent-[var(--accent)]" /> {label}
    </label>
  );
}

export function StudentForm({ initial }: { initial?: Student }) {
  const [state, action, pending] = useActionState<FormState, FormData>(
    initial ? updateStudent.bind(null, initial.id) : createStudent,
    {},
  );
  const v = (k: keyof Student) => (initial?.[k] ?? '') as string | number;
  const c = (k: keyof Student) => Boolean(initial?.[k]);
  const err = state.errors ?? {};

  return (
    <form action={action} className="space-y-6">
      <section className="card grid gap-4 sm:grid-cols-2">
        <h2 className="font-semibold sm:col-span-2">Dados básicos</h2>
        <Field label="Nome completo *" error={err.nome}><input name="nome" defaultValue={v("nome")} required className="input" /></Field>
        <Field label="E-mail *" error={err.email}><input name="email" defaultValue={v("email")} type="email" required className="input" /></Field>
        <Field label="Contato (telefone) *" error={err.contato}><input name="contato" defaultValue={v("contato")} required className="input" placeholder="(11) 99999-0000" /></Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Idade *" error={err.idade}><input name="idade" defaultValue={v("idade")} type="number" min={10} max={110} required className="input" /></Field>
          <Field label="Sexo *" error={err.sexo}>
            <select name="sexo" required className="input" defaultValue={initial?.sexo ?? ''}>
              <option value="" disabled>Selecione</option>
              <option value="masculino">Masculino</option>
              <option value="feminino">Feminino</option>
            </select>
          </Field>
        </div>
      </section>

      <section className="card space-y-5">
        <h2 className="font-semibold">Anamnese</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Treina há quanto tempo?"><input name="tempoDeTreino" defaultValue={v("tempoDeTreino")} className="input" /></Field>
          <Field label="Tempo sem atividade física?"><input name="tempoSemAtividadeFisica" defaultValue={v("tempoSemAtividadeFisica")} className="input" /></Field>
          <Field label="Objetivo?"><input name="objetivo" defaultValue={v("objetivo")} className="input" /></Field>
          <Field label="Frequência semanal (dias)" error={err.frequenciaSemanal}><input name="frequenciaSemanal" defaultValue={v("frequenciaSemanal")} type="number" min={0} max={7} className="input" /></Field>
          <Field label="Tempo de treino por dia?"><input name="tempoTreinoPorDia" defaultValue={v("tempoTreinoPorDia")} className="input" placeholder="Ex.: 1h" /></Field>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {YES_NO.map(([n, l]) => <Check key={n} name={n} label={l} checked={c(n as keyof Student)} />)}
        </div>

        <div className="space-y-3">
          {YES_NO_DETAIL.map(([flag, detail, label, ph]) => (
            <div key={flag} className="grid items-center gap-2 sm:grid-cols-[260px_1fr]">
              <Check name={flag} label={label} checked={c(flag as keyof Student)} />
              <input name={detail} defaultValue={v(detail as keyof Student)} className="input" placeholder={ph} aria-label={`${label} ${ph}`} />
            </div>
          ))}
        </div>
      </section>

      <FormMessage state={state} />
      <div className="flex gap-3">
        <button className="btn disabled:opacity-60" type="submit" disabled={pending}>{pending ? 'Salvando…' : initial ? 'Salvar alterações' : 'Cadastrar aluno'}</button>
        <Link href={initial ? `/alunos/${initial.id}` : '/'} className="btn-ghost">Cancelar</Link>
      </div>
    </form>
  );
}
