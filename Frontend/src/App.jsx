// App.jsx
import { Routes, Route } from "react-router-dom";
import "./App.css";
import Navbar from "./component/navbar.jsx";
import Favorite from "./backendPage/Favorite.jsx";
import HorizontalHome from "./HorizontalHome.jsx";
import { NotesProvider } from "./contexts/NotesContext.jsx";
import Login from "./backendPage/Login.jsx";
import Signup from "./backendpage/Signup.jsx";
import ProtectedRoute from "./component/ProtectedRoute.jsx";

function App() {
  return (
    <>
      <NotesProvider>
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<HorizontalHome />} />
            <Route path="/favorite" element={<Favorite />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route
              path="/favorite"
              element={
                <ProtectedRoute>
                  <Favorite />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
      </NotesProvider>
    </>
  );
}

export default App;
