// App.jsx
import { Routes, Route } from "react-router-dom";
import "./App.css";
import Navbar from "./component/Navbar.jsx";
import Favorite from "./backendPage/Favorite.jsx";
import HorizontalHome from "./HorizontalHome.jsx";
import Forth from "./pages/Forth.jsx";
import { NotesProvider } from "./contexts/NotesContext.jsx";
import Login from "./backendPage/Login.jsx";
import Signup from "./backendPage/Signup.jsx";
import CreateNote from "./backendPage/CreateNote.jsx";
import Profile from "./backendPage/Profile.jsx";
import Dashboard from "./backendPage/Dashboard.jsx";
import SearchResults from "./backendPage/SearchResults.jsx";
import ProtectedRoute from "./component/ProtectedRoute.jsx";
import CreatorDashboard from "./backendPage/CreatorDashboard.jsx";
import PdfChat from "./component/PdfChat.jsx";
import BrowseNotes from "./backendPage/BrowseNotes.jsx";


function App() {
  return (
    <>
      <NotesProvider>
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<HorizontalHome />} />
            <Route path="/notes" element={<Forth />} />
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
            <Route
              path="/create"
              element={
                <ProtectedRoute>
                  <CreateNote />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/creatorDashboard" element={<CreatorDashboard />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/pdf-chat" element={<PdfChat />} />
            <Route path="/browse" element={<BrowseNotes />} />
          </Routes>
        </main>
      </NotesProvider>
    </>
  );
}

export default App;
