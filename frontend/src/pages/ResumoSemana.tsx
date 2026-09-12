import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { obterResumoSemana } from '../api/resumoSemana';
import { BonecoSVG } from '../components/BonecoSVG/BonecoSVG';
import { useAuth } from '../context/AuthContext';
import { GRUPOS_MUSCULARES, GRUPO_MUSCULAR_LABEL } from '../types/treino';
import type { ResumoSemana as ResumoSemanaType } from '../types/resumoSemana';

function formatarData(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

export function ResumoSemana() {
  const { usuario } = useAuth();
  const [resumo, setResumo] = useState<ResumoSemanaType | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    obterResumoSemana()
      .then(setResumo)
      .catch(() => setErro('Erro ao carregar o resumo da semana.'))
      .finally(() => setCarregando(false));
  }, []);

  const volumePorGrupo = resumo?.volumePorGrupo ?? {};
  const maxVolume = Math.max(1, ...Object.values(volumePorGrupo));

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 px-4 py-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Resumo da Semana</h1>
          <Link to="/" className="text-sm text-slate-400 hover:text-slate-100">
            ← Voltar
          </Link>
        </header>

        {erro && <p className="text-red-400 text-sm">{erro}</p>}

        {resumo && (
          <p className="text-slate-400 text-sm">
            Semana de {formatarData(resumo.inicio)} a{' '}
            {formatarData(new Date(new Date(resumo.fim).getTime() - 86400000).toISOString())}
          </p>
        )}

        {carregando ? (
          <p className="text-slate-400">Carregando...</p>
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 grid md:grid-cols-[1.3fr_1fr] gap-6">
            <BonecoSVG sexo={usuario?.sexo ?? 'MASCULINO'} intensidades={volumePorGrupo} />

            <div className="space-y-2">
              <h2 className="text-sm font-semibold text-slate-300">
                Séries realizadas por grupo muscular
              </h2>
              <ul className="space-y-1.5">
                {GRUPOS_MUSCULARES.map((grupo) => {
                  const volume = volumePorGrupo[grupo] ?? 0;
                  return (
                    <li key={grupo} className="flex items-center gap-2 text-sm">
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{
                          backgroundColor:
                            volume > 0
                              ? `rgba(52, 211, 153, ${0.25 + (volume / maxVolume) * 0.75})`
                              : '#334155',
                        }}
                      />
                      <span className="text-slate-300 flex-1">{GRUPO_MUSCULAR_LABEL[grupo]}</span>
                      <span className="text-slate-500">{volume} séries</span>
                    </li>
                  );
                })}
              </ul>
              {!usuario?.sexo && (
                <p className="text-xs text-slate-500 pt-2">
                  Dica: defina seu sexo no cadastro para escolher o boneco masculino ou feminino.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
