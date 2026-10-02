export function DbError({ error }: { error: unknown }) {
  console.error(error);
  const missing = !process.env.DATABASE_URL;
  return (
    <div className="card border-red-500/40">
      <h2 className="font-semibold">Banco de dados indisponível</h2>
      <p className="mt-1 text-sm text-muted">
        {missing
          ? 'A variável DATABASE_URL não está definida. Configure a connection string do Neon e rode npm run db:migrate.'
          : 'Não foi possível consultar o banco. Verifique a conexão e se as migrations foram aplicadas (npm run db:migrate).'}
      </p>
    </div>
  );
}
