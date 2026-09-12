import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { Sexo } from '../types/auth';

export function Cadastro() {
  const { registrar } = useAuth();
  const navigate = useNavigate();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [sexo, setSexo] = useState<Sexo | ''>('');
  const [codigo, setCodigo] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErro(null);
    setEnviando(true);
    try {
      await registrar({
        nome,
        email,
        senha,
        sexo: sexo || undefined,
        codigo: codigo || undefined,
      });
      navigate('/');
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao cadastrar.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-4 py-8">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-slate-900 rounded-xl p-6 space-y-4 border border-slate-800"
      >
        <h1 className="text-2xl font-bold">Criar conta</h1>

        {erro && <p className="text-red-400 text-sm">{erro}</p>}

        <div className="space-y-1">
          <label className="text-sm text-slate-400">Nome</label>
          <input
            required
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="w-full rounded-md bg-slate-800 border border-slate-700 px-3 py-2 outline-none focus:border-emerald-500"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm text-slate-400">E-mail</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md bg-slate-800 border border-slate-700 px-3 py-2 outline-none focus:border-emerald-500"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm text-slate-400">Senha</label>
          <input
            type="password"
            required
            minLength={6}
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            className="w-full rounded-md bg-slate-800 border border-slate-700 px-3 py-2 outline-none focus:border-emerald-500"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm text-slate-400">Sexo (para o boneco de progresso)</label>
          <select
            value={sexo}
            onChange={(e) => setSexo(e.target.value as Sexo)}
            className="w-full rounded-md bg-slate-800 border border-slate-700 px-3 py-2 outline-none focus:border-emerald-500"
          >
            <option value="">Selecionar...</option>
            <option value="MASCULINO">Masculino</option>
            <option value="FEMININO">Feminino</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-sm text-slate-400">Código de convite</label>
          <input
            value={codigo}
            onChange={(e) => setCodigo(e.target.value.toUpperCase())}
            placeholder="Fornecido pelo administrador"
            className="w-full rounded-md bg-slate-800 border border-slate-700 px-3 py-2 outline-none focus:border-emerald-500 uppercase"
          />
        </div>

        <button
          type="submit"
          disabled={enviando}
          className="w-full rounded-md bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-semibold py-2 transition"
        >
          {enviando ? 'Cadastrando...' : 'Cadastrar'}
        </button>

        <p className="text-sm text-slate-400 text-center">
          Já tem conta?{' '}
          <Link to="/login" className="text-emerald-400 hover:underline">
            Entrar
          </Link>
        </p>
      </form>
    </div>
  );
}
