import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './style.css';

function Favoritos() {
  const navigate = useNavigate();

  const [personajesFavoritos] = useState(() => {
    try {
      const guardados = JSON.parse(
        localStorage.getItem('favoritos') || '[]'
      );

      return Array.isArray(guardados) ? guardados : [];
    } catch {
      return [];
    }
  });

  return (
    <>
    <h1>Favoritos</h1>
      <div className="c-lista">
        {personajesFavoritos.map((personaje) => (
          <div
            key={personaje.id}
            className="c-lista-personaje"
            onClick={() =>
              navigate(`/personajes/${personaje.id}`)
            }
          >
            <p>#{personaje.id}</p>

            <p>{personaje.nombre}</p>

            <img
              src={personaje.imagen}
              alt={`Personaje ${personaje.nombre}`}
              loading="lazy"
            />
          </div>
        ))}
      </div>
    </>
  );
}

export default Favoritos;