import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './style.css';

function Inicio() {
  const [todosLosPersonajes, setTodosLosPersonajes] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [razaSeleccionada, setRazaSeleccionada] = useState('All');
  const [cargando, setCargando] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const cargarPersonajes = async () => {
      try {
        let pagina = 1;
        let totalPaginas = 1;
        let personajesCargados = [];

        while (pagina <= totalPaginas) {
          const response = await fetch(
            `https://dragonball-api.com/api/characters?page=${pagina}&limit=100`
          );

          if (!response.ok) {
            throw new Error('No se pudieron cargar los personajes');
          }

          const datos = await response.json();

          // La API devuelve los personajes dentro de "items".
          const personajesPagina = Array.isArray(datos)
            ? datos
            : datos.items || [];

          personajesCargados = [
            ...personajesCargados,
            ...personajesPagina
          ];

          totalPaginas = datos.meta?.totalPages || 1;
          pagina++;
        }

        setTodosLosPersonajes(personajesCargados);
      } catch (error) {
        console.error('Error al cargar personajes de Dragon Ball:', error);
      } finally {
        setCargando(false);
      }
    };

    cargarPersonajes();
  }, []);

  // Obtener las razas disponibles en los personajes cargados.
  const razas = [
    'All',
    ...new Set(
      todosLosPersonajes
        .map((personaje) => personaje.race)
        .filter((raza) => raza && raza.trim() !== '')
        .sort((a, b) => a.localeCompare(b))
    )
  ];

  // Filtrar por raza seleccionada.
  const personajesPorRaza = razaSeleccionada === 'All'
    ? todosLosPersonajes
    : todosLosPersonajes.filter(
        (personaje) => personaje.race === razaSeleccionada
      );

  // Mantener el comportamiento original del buscador.
  const resultados = busqueda.trim().length >= 3 && isNaN(busqueda)
    ? personajesPorRaza.filter((personaje) =>
        personaje.name.toLowerCase().includes(busqueda.toLowerCase())
      )
    : personajesPorRaza;

  if (cargando) return <p>Cargando personajes...</p>;

  if (todosLosPersonajes.length === 0) {
    return <p>No se pudieron cargar los personajes. Intenta nuevamente.</p>;
  }

  return (
    <>
      <div className="c-filtro">
        {razas.map((raza, index) => (
          <button
            type="button"
            key={index}
            onClick={() => setRazaSeleccionada(raza)}
          >
            {raza === 'All' ? 'Todos' : raza}
          </button>
        ))}
      </div>

      <input
        type="text"
        placeholder="Buscar personaje"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        className="c-buscador"
      />

      {resultados.length === 0 ? (
        <p>No se encontraron personajes.</p>
      ) : (
        <div className="c-lista">
          {resultados.map((personaje) => (
            <div
              className="c-lista-pokemon"
              key={personaje.id}
              onClick={() => navigate(`/personajes/${personaje.id}`)}
            >
              <p>#{personaje.id}</p>

              <p>{personaje.name}</p>

              <img
                src={personaje.image}
                alt={personaje.name}
                width="auto"
                height="60"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      )}
    </>
  );
}

export default Inicio;