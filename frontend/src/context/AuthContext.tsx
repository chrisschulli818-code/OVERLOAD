import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { AxiosError } from 'axios';
import { api } from '../api/client';
import type { Sexo, Usuario } from '../types/auth';

interface AuthContextValue {
  usuario: Usuario | null;
  carregando: boolean;
  login: (email: string, senha: string) => Promise<void>;
  registrar: (dados: {
    nome: string;
    email: string;
    senha: string;
    sexo?: Sexo;
    codigo?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function extrairErro(err: unknown, fallback: string): string {
  if (err instanceof AxiosError) {
    return err.response?.data?.error ?? fallback;
  }
  return fallback;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    api
      .get<Usuario>('/auth/me')
      .then((res) => setUsuario(res.data))
      .catch(() => setUsuario(null))
      .finally(() => setCarregando(false));
  }, []);

  const login = useCallback(async (email: string, senha: string) => {
    try {
      const res = await api.post<Usuario>('/auth/login', { email, senha });
      setUsuario(res.data);
    } catch (err) {
      throw new Error(extrairErro(err, 'Não foi possível fazer login.'));
    }
  }, []);

  const registrar = useCallback(
    async (dados: { nome: string; email: string; senha: string; sexo?: Sexo; codigo?: string }) => {
      try {
        const res = await api.post<Usuario>('/auth/register', dados);
        setUsuario(res.data);
      } catch (err) {
        throw new Error(extrairErro(err, 'Não foi possível concluir o cadastro.'));
      }
    },
    [],
  );

  const logout = useCallback(async () => {
    await api.post('/auth/logout');
    setUsuario(null);
  }, []);

  return (
    <AuthContext.Provider value={{ usuario, carregando, login, registrar, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider.');
  }
  return ctx;
}
