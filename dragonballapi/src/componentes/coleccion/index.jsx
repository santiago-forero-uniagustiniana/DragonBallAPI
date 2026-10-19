import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './style.css';

function Coleccion() {
  const [personajes, setPersonajes] = useState([]);
  const [listaCapturados, setListaCapturados] = useState(() => {
    try {
      const guardados = JSON.parse(localStorage.getItem('misNumeros') || '[]');
      return Array.isArray(guardados)
        ? [...new Set(guardados.map(Number))]
        : [];
    } catch {
      return [];
    }
  });
  const [nuevos, setNuevos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const navigate = useNavigate();

  const totalPersonajes = personajes.length;

  useEffect(() => {
    fetch('https://dragonball-api.com/api/characters?limit=100')
      .then((respuesta) => {
        if (!respuesta.ok) {
          throw new Error('No se pudieron cargar los personajes');
        }
        return respuesta.json();
      })
      .then((datos) => {
        const resultados = Array.isArray(datos)
          ? datos
          : datos.items || datos.results || datos.data || [];

        setPersonajes(resultados);
      })
      .catch((error) => {
        console.error('Error al cargar personajes de Dragon Ball:', error);
      })
      .finally(() => setCargando(false));
  }, []);

  const capturarAleatorios = () => {
    if (personajes.length === 0) return;

    const disponibles = personajes.filter(
      (personaje) => !listaCapturados.includes(Number(personaje.id))
    );

    const seleccionados = [];

    // Seleccionar hasta cuatro personajes que aún no se hayan capturado.
    const candidatos = [...disponibles];

    for (let i = 0; i < 4 && candidatos.length > 0; i++) {
      const indice = Math.floor(Math.random() * candidatos.length);
      seleccionados.push(candidatos.splice(indice, 1)[0]);
    }

    const repetidos = personajes.filter(
      (personaje) => listaCapturados.includes(Number(personaje.id))
    );

    while (seleccionados.length < 4 && repetidos.length > 0) {
      const indice = Math.floor(Math.random() * repetidos.length);
      seleccionados.push(repetidos[indice]);
    }

    const vistos = new Set(listaCapturados);

    const resultados = seleccionados.map((personaje) => {
      const id = Number(personaje.id);
      const repetido = vistos.has(id);

      vistos.add(id);

      return { ...personaje, repetido };
    });

    const actualizados = [...vistos];

    setListaCapturados(actualizados);
    setNuevos(resultados);
    localStorage.setItem('misNumeros', JSON.stringify(actualizados));
  };

  return (
    <main className="coleccion">
      <h1 className="coleccion-titulo">Coleccion de personajes</h1>

      <p className="coleccion-contador">
        {listaCapturados.filter((id) =>
          personajes.some((personaje) => Number(personaje.id) === id)
        ).length}
        <span> / {cargando ? '...' : totalPersonajes}</span>
      </p>

      <button
        className="coleccion-boton"
        onClick={capturarAleatorios}
        disabled={cargando || personajes.length === 0}
      >
        {cargando ? 'Cargando...' : '4 nuevos'}
      </button>

      {nuevos.length > 0 && (
        <h2 className="coleccion-subtitulo">
          Tus nuevos personajes
        </h2>
      )}

      <section className="coleccion-nuevos">
        {nuevos.map((personaje, indice) => (
          <div
            key={`${personaje.id}-${indice}`}
            className={
              personaje.repetido
                ? 'coleccion-nuevo repetido'
                : 'coleccion-nuevo'
            }
            onClick={() =>
              navigate(`/personajes/${personaje.id}`)
            }
          >
            <p>{personaje.id}</p>

            <img
              src={personaje.image}
              alt={personaje.name}
              width="60"
              height="60"
              loading="lazy"
            />

            <p>{personaje.name}</p>
          </div>
        ))}
      </section>

      <section className="coleccion-album">
        {personajes.map((personaje) => {
          const capturado = listaCapturados.includes(
            Number(personaje.id)
          );

          return (
            <div
              key={personaje.id}
              className={
                capturado
                  ? 'coleccion-pokemon capturado'
                  : 'coleccion-pokemon'
              }
              onClick={() =>
                capturado &&
                navigate(`/personajes/${personaje.id}`)
              }
            >
              {capturado && (
                <img
                  src={personaje.image}
                  width="auto"
                  height="45"
                  loading="lazy"
                  alt={personaje.name}
                />
              )}

              <p>{personaje.id}</p>
            </div>
          );
        })}
      </section>
    </main>
  );
}

export default Coleccion;