import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom';
import { NotesProvider } from "./contexts/NotesContext.jsx";
import { AuthProvider } from "./contexts/AuthContext.jsx";

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
  <AuthProvider>
    <NotesProvider>
      <App />
    </NotesProvider>
  </AuthProvider>
</BrowserRouter>
)