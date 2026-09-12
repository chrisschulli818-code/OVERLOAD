import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { RotaProtegida } from './components/RotaProtegida';
import { AuthProvider } from './context/AuthContext';
import { AdminDashboard } from './pages/AdminDashboard';
import { Cadastro } from './pages/Cadastro';
import { Home } from './pages/Home';
import { ImportarPdf } from './pages/ImportarPdf';
import { Login } from './pages/Login';
import { MeusTreinos } from './pages/MeusTreinos';
import { Progresso } from './pages/Progresso';
import { TreinoDoDia } from './pages/TreinoDoDia';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/cadastro" element={<Cadastro />} />
          <Route
            path="/"
            element={
              <RotaProtegida>
                <Home />
              </RotaProtegida>
            }
          />
          <Route
            path="/treinos"
            element={
              <RotaProtegida>
                <MeusTreinos />
              </RotaProtegida>
            }
          />
          <Route
            path="/treinos/importar-pdf"
            element={
              <RotaProtegida>
                <ImportarPdf />
              </RotaProtegida>
            }
          />
          <Route
            path="/treino-do-dia"
            element={
              <RotaProtegida>
                <TreinoDoDia />
              </RotaProtegida>
            }
          />
          <Route
            path="/progresso"
            element={
              <RotaProtegida>
                <Progresso />
              </RotaProtegida>
            }
          />
          <Route
            path="/admin"
            element={
              <RotaProtegida papelExigido="ADMIN">
                <AdminDashboard />
              </RotaProtegida>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
