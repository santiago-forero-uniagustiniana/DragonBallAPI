import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Coleccion from "./componentes/coleccion";
import Favoritos from "./componentes/favoritos";
import Info from "./componentes/info";
import Inicio from "./componentes/inicio";
import Juego from "./componentes/juego";
import "./App.css";
import Personajes from "./componentes/personajes";

function App() {
    
  return (
    <>
      <Router>

        <nav className='c-menu'>
          <Link to="/">Inicio</Link>
          <Link to="/coleccion">Coleccion</Link>
          <Link to="/favoritos">Favoritos</Link>
          <Link to="/juego">Juego</Link>
          <Link to="/info">Info</Link>
        </nav>

        <Routes>
          <Route path="/" element={<Inicio />} />
          <Route path="/coleccion" element={<Coleccion />} />
          <Route path="/favoritos" element={<Favoritos />} />
          <Route path="/info" element={<Info />} />
          <Route path="/juego" element={<Juego />} />
          <Route path="/personajes/:name" element={<Personajes />} />
        </Routes>

      </Router>
    </>
  );
}

export default App;