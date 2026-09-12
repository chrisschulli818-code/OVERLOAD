import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { Role } from '../types/auth';

export function RotaProtegida({
  children,
  papelExigido,
}: {
  children: ReactNode;
  papelExigido?: Role;
}) {
  const { usuario, carregando } = useAuth();

  if (carregando) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        Carregando...
      </div>
    );
  }

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  if (papelExigido && usuario.role !== papelExigido) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
