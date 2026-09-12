import { AxiosError } from 'axios';
import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import type { CodigoAcesso, UsuarioAdmin } from '../types/admin';

export function AdminDashboard() {
  const { usuario, logout } = useAuth();
  const [codigos, setCodigos] = useState<CodigoAcesso[]>([]);
  const [usuarios, setUsuarios] = useState<UsuarioAdmin[]>([]);
  const [limiteUsos, setLimiteUsos] = useState(1);
  const [validoAteDias, setValidoAteDias] = useState<number | ''>('');
  const [erro, setErro] = useState<string | null>(null);
  const [gerando, setGerando] = useState(false);

  const carregar = useCallback(async () => {
    const [resCodigos, resUsuarios] = await Promise.all([
      api.get<CodigoAcesso[]>('/admin/codigos'),
      api.get<UsuarioAdmin[]>('/admin/usuarios'),
    ]);
    setCodigos(resCodigos.data);
    setUsuarios(resUsuarios.data);
  }, []);

  useEffect(() => {
    carregar().catch(() => setErro('Erro ao carregar dados.'));
  }, [carregar]);

  async function handleGerarCodigo(e: FormEvent) {
    e.preventDefault();
    setErro(null);
    setGerando(true);
    try {
      await api.post('/admin/codigos', {
        limiteUsos,
        validoAteDias: validoAteDias === '' ? undefined : validoAteDias,
      });
      await carregar();
    } catch (err) {
      const msg =
        err instanceof AxiosError ? err.response?.data?.error : 'Erro ao gerar código.';
      setErro(msg ?? 'Erro ao gerar código.');
    } finally {
      setGerando(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Painel do Administrador</h1>
            <p className="text-slate-400 text-sm">Logado como {usuario?.nome}</p>
          </div>
          <button
            onClick={() => logout()}
            className="text-sm text-slate-400 hover:text-slate-100 border border-slate-700 rounded-md px-3 py-1.5"
          >
            Sair
          </button>
        </header>

        {erro && <p className="text-red-400 text-sm">{erro}</p>}

        <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-semibold">Gerar código de convite</h2>
          <form onSubmit={handleGerarCodigo} className="flex flex-wrap gap-4 items-end">
            <div className="space-y-1">
              <label className="text-sm text-slate-400">Limite de usos</label>
              <input
                type="number"
                min={1}
                value={limiteUsos}
                onChange={(e) => setLimiteUsos(Number(e.target.value))}
                className="w-28 rounded-md bg-slate-800 border border-slate-700 px-3 py-2 outline-none focus:border-emerald-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm text-slate-400">Validade (dias, opcional)</label>
              <input
                type="number"
                min={1}
                value={validoAteDias}
                onChange={(e) =>
                  setValidoAteDias(e.target.value === '' ? '' : Number(e.target.value))
                }
                className="w-40 rounded-md bg-slate-800 border border-slate-700 px-3 py-2 outline-none focus:border-emerald-500"
              />
            </div>
            <button
              type="submit"
              disabled={gerando}
              className="rounded-md bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-semibold px-4 py-2 transition"
            >
              {gerando ? 'Gerando...' : 'Gerar código'}
            </button>
          </form>
        </section>

        <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-semibold">Códigos gerados</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-400 border-b border-slate-800">
                  <th className="py-2 pr-4">Código</th>
                  <th className="py-2 pr-4">Usos</th>
                  <th className="py-2 pr-4">Expira em</th>
                  <th className="py-2 pr-4">Usado por</th>
                </tr>
              </thead>
              <tbody>
                {codigos.map((c) => (
                  <tr key={c.id} className="border-b border-slate-800/50">
                    <td className="py-2 pr-4 font-mono">{c.codigo}</td>
                    <td className="py-2 pr-4">
                      {c.usosCount}/{c.limiteUsos}
                    </td>
                    <td className="py-2 pr-4">
                      {c.expiraEm ? new Date(c.expiraEm).toLocaleDateString('pt-BR') : '—'}
                    </td>
                    <td className="py-2 pr-4">
                      {c.usadoPor.length === 0
                        ? '—'
                        : c.usadoPor.map((u) => u.nome).join(', ')}
                    </td>
                  </tr>
                ))}
                {codigos.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-4 text-slate-500 text-center">
                      Nenhum código gerado ainda.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-semibold">Usuários cadastrados</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-400 border-b border-slate-800">
                  <th className="py-2 pr-4">Nome</th>
                  <th className="py-2 pr-4">E-mail</th>
                  <th className="py-2 pr-4">Papel</th>
                  <th className="py-2 pr-4">Código usado</th>
                  <th className="py-2 pr-4">Cadastrado em</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map((u) => (
                  <tr key={u.id} className="border-b border-slate-800/50">
                    <td className="py-2 pr-4">{u.nome}</td>
                    <td className="py-2 pr-4">{u.email}</td>
                    <td className="py-2 pr-4">{u.role}</td>
                    <td className="py-2 pr-4 font-mono">{u.codigoUsado?.codigo ?? '—'}</td>
                    <td className="py-2 pr-4">
                      {new Date(u.criadoEm).toLocaleDateString('pt-BR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
