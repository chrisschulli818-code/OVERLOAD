import { useState } from 'react';
import { corPorIntensidade } from './cores';
import { GRUPO_MUSCULAR_LABEL, type GrupoMuscular } from '../../types/treino';

const COR_TRACO = '#0f172a'; // slate-900, contorno
const COR_NEUTRA = '#334155'; // slate-700, partes não rastreadas (cabeça, mãos, pés, canelas)

interface BonecoSVGProps {
  sexo: 'MASCULINO' | 'FEMININO';
  intensidades: Partial<Record<GrupoMuscular, number>>;
  onHoverGrupo?: (grupo: GrupoMuscular | null) => void;
}

export function BonecoSVG({ sexo, intensidades, onHoverGrupo }: BonecoSVGProps) {
  const [grupoAtivo, setGrupoAtivo] = useState<GrupoMuscular | null>(null);

  const ehFeminino = sexo === 'FEMININO';
  // Deslocamento do centro dos ombros/quadril: silhueta feminina com ombros
  // um pouco mais estreitos e quadril um pouco mais largo — diferenciação
  // simples, não anatômica.
  const deslocOmbro = ehFeminino ? 30 : 34;
  const raioQuadril = ehFeminino ? 34 : 28;

  function corDoGrupo(grupo: GrupoMuscular): string {
    return corPorIntensidade(intensidades[grupo] ?? 0);
  }

  function props(grupo: GrupoMuscular) {
    return {
      fill: corDoGrupo(grupo),
      stroke: COR_TRACO,
      strokeWidth: 1.5,
      onMouseEnter: () => {
        setGrupoAtivo(grupo);
        onHoverGrupo?.(grupo);
      },
      onMouseLeave: () => {
        setGrupoAtivo(null);
        onHoverGrupo?.(null);
      },
      style: { cursor: 'pointer', transition: 'fill 0.2s' },
    };
  }

  const neutro = { fill: COR_NEUTRA, stroke: COR_TRACO, strokeWidth: 1.5 };

  const bracoEsq = 100 - deslocOmbro - 10;
  const bracoDir = 100 + deslocOmbro - 10;

  return (
    <div className="space-y-2">
      <svg
        viewBox="0 0 460 400"
        className="w-full max-w-xl mx-auto"
        role="img"
        aria-label="Boneco de grupos musculares"
      >
        <text x="100" y="15" textAnchor="middle" fill="#94a3b8" fontSize="12">
          Frente
        </text>
        <text x="360" y="15" textAnchor="middle" fill="#94a3b8" fontSize="12">
          Costas
        </text>

        {/* ---------- FRENTE ---------- */}
        <g transform="translate(0, 20)">
          {/* pés e canelas (neutros) */}
          <rect x="72" y="237" width="20" height="55" rx="8" {...neutro} />
          <rect x="108" y="237" width="20" height="55" rx="8" {...neutro} />
          <ellipse cx="82" cy="297" rx="12" ry="6" {...neutro} />
          <ellipse cx="118" cy="297" rx="12" ry="6" {...neutro} />

          {/* quadríceps */}
          <rect x="70" y="165" width="27" height="72" rx="10" {...props('QUADRICEPS')} />
          <rect x="103" y="165" width="27" height="72" rx="10" {...props('QUADRICEPS')} />

          {/* braços: bíceps + antebraço + mão */}
          <rect x={bracoEsq} y="70" width="20" height="55" rx="9" {...props('BICEPS')} />
          <rect x={bracoDir} y="70" width="20" height="55" rx="9" {...props('BICEPS')} />
          <rect x={bracoEsq} y="123" width="20" height="50" rx="8" {...props('ANTEBRACO')} />
          <rect x={bracoDir} y="123" width="20" height="50" rx="8" {...props('ANTEBRACO')} />
          <ellipse cx={bracoEsq + 10} cy="175" rx="9" ry="8" {...neutro} />
          <ellipse cx={bracoDir + 10} cy="175" rx="9" ry="8" {...neutro} />

          {/* tronco: abdômen + peito */}
          <rect x="76" y="108" width="48" height="58" rx="8" {...props('ABDOMEN')} />
          <rect x="70" y="64" width="60" height="46" rx="12" {...props('PEITO')} />

          {/* ombros (por cima, conectando tronco e braço) */}
          <ellipse cx={100 - deslocOmbro} cy="72" rx="17" ry="15" {...props('OMBROS')} />
          <ellipse cx={100 + deslocOmbro} cy="72" rx="17" ry="15" {...props('OMBROS')} />

          {/* pescoço e cabeça (neutros) */}
          <rect x="92" y="46" width="16" height="12" {...neutro} />
          <ellipse cx="100" cy="28" rx="17" ry="19" {...neutro} />
        </g>

        {/* ---------- COSTAS ---------- */}
        <g transform="translate(260, 20)">
          {/* pés e panturrilhas */}
          <ellipse cx="82" cy="297" rx="12" ry="6" {...neutro} />
          <ellipse cx="118" cy="297" rx="12" ry="6" {...neutro} />
          <rect x="72" y="240" width="20" height="52" rx="8" {...props('PANTURRILHA')} />
          <rect x="108" y="240" width="20" height="52" rx="8" {...props('PANTURRILHA')} />

          {/* posterior de coxa */}
          <rect x="70" y="172" width="27" height="70" rx="10" {...props('POSTERIOR_COXA')} />
          <rect x="103" y="172" width="27" height="70" rx="10" {...props('POSTERIOR_COXA')} />

          {/* glúteos */}
          <ellipse cx="100" cy="163" rx={raioQuadril} ry="20" {...props('GLUTEOS')} />

          {/* braços: tríceps + antebraço + mão */}
          <rect x={bracoEsq} y="70" width="20" height="55" rx="9" {...props('TRICEPS')} />
          <rect x={bracoDir} y="70" width="20" height="55" rx="9" {...props('TRICEPS')} />
          <rect x={bracoEsq} y="123" width="20" height="50" rx="8" {...props('ANTEBRACO')} />
          <rect x={bracoDir} y="123" width="20" height="50" rx="8" {...props('ANTEBRACO')} />
          <ellipse cx={bracoEsq + 10} cy="175" rx="9" ry="8" {...neutro} />
          <ellipse cx={bracoDir + 10} cy="175" rx="9" ry="8" {...neutro} />

          {/* costas */}
          <rect x="70" y="64" width="60" height="76" rx="12" {...props('COSTAS')} />

          {/* ombros (por cima) */}
          <ellipse cx={100 - deslocOmbro} cy="72" rx="17" ry="15" {...props('OMBROS')} />
          <ellipse cx={100 + deslocOmbro} cy="72" rx="17" ry="15" {...props('OMBROS')} />

          {/* pescoço e cabeça (neutros) */}
          <rect x="92" y="46" width="16" height="12" {...neutro} />
          <ellipse cx="100" cy="28" rx="17" ry="19" {...neutro} />
        </g>
      </svg>
      <p className="text-center text-sm text-slate-400 h-5" aria-live="polite">
        {grupoAtivo ? GRUPO_MUSCULAR_LABEL[grupoAtivo] : ''}
      </p>
    </div>
  );
}
