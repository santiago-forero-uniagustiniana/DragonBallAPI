import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './style.css';

function Personaje() {
  const { name: identificadorPersonaje } = useParams();

  const [personaje, setPersonaje] = useState(null);
  const [transformacionSeleccionada, setTransformacionSeleccionada] = useState(null);
  const [cargando, setCargando] = useState(true);

  const [favoritos, setFavoritos] = useState(() => {
    try {
      const guardados = JSON.parse(
        localStorage.getItem('favoritos') || '[]'
      );

      return Array.isArray(guardados) ? guardados : [];
    } catch {
      return [];
    }
  });

  const esFavorito = favoritos.some(
    (elemento) => Number(elemento.id) === Number(personaje?.id)
  );

  useEffect(() => {
    const cargarPersonaje = async () => {
      setCargando(true);
      setPersonaje(null);
      setTransformacionSeleccionada(null);

      try {
        const respuesta = await fetch(
          `https://dragonball-api.com/api/characters/${identificadorPersonaje}`
        );

        if (!respuesta.ok) {
          throw new Error('No se pudo cargar el personaje');
        }

        const datos = await respuesta.json();

        setPersonaje(datos);

        // Si tiene transformaciones, comienza en su forma base.
        const transformaciones = Array.isArray(datos.transformations)
          ? datos.transformations
          : [];

        setTransformacionSeleccionada(
          transformaciones.length > 0 ? 'base' : null
        );
      } catch (error) {
        console.error('Error al cargar el personaje:', error);
      } finally {
        setCargando(false);
      }
    };

    cargarPersonaje();
  }, [identificadorPersonaje]);

  const toggleFavorito = () => {
    if (!personaje) return;

    let nuevosFavoritos;

    if (esFavorito) {
      nuevosFavoritos = favoritos.filter(
        (elemento) => Number(elemento.id) !== Number(personaje.id)
      );
    } else {
      nuevosFavoritos = [
        ...favoritos,
        {
          id: personaje.id,
          nombre: personaje.name,
          imagen: personaje.image
        }
      ];
    }

    setFavoritos(nuevosFavoritos);

    localStorage.setItem(
      'favoritos',
      JSON.stringify(nuevosFavoritos)
    );
  };

  if (cargando) {
    return <p>Cargando personaje...</p>;
  }

  if (!personaje) {
    return <p>No se pudo cargar el personaje.</p>;
  }

  const transformaciones = Array.isArray(personaje.transformations)
    ? personaje.transformations
    : [];

  const tieneTransformaciones = transformaciones.length > 0;

  const transformacionActual =
    tieneTransformaciones && transformacionSeleccionada !== 'base'
      ? transformaciones.find(
          (transformacion) =>
            String(transformacion.id) ===
            String(transformacionSeleccionada)
        )
      : null;

  const nombreTransformacion = transformacionActual?.name || 'Base';

  const imagenActual =
    transformacionActual?.image || personaje.image;

  const kiActual =
    transformacionActual?.ki ?? personaje.ki ?? 'Desconocido';

  const planeta =
    typeof personaje.originPlanet === 'object'
      ? personaje.originPlanet?.name
      : personaje.originPlanet;

  return (
    <div className="personaje-detalle">
      <h1>{personaje.name}</h1>

      {tieneTransformaciones && (
        <p>{nombreTransformacion === 'Base'
          ? 'Base'
          : nombreTransformacion}</p>
      )}

      {tieneTransformaciones && (
        <div className="personaje-transformaciones">

          <div className="personaje-lista-transformaciones">
            <button
              type="button"
              className={
                transformacionSeleccionada === 'base'
                  ? 'transformacion-boton activa'
                  : 'transformacion-boton'
              }
              onClick={() => setTransformacionSeleccionada('base')}
            >
              Base
            </button>

            {transformaciones.map((transformacion) => (
              <button
                type="button"
                key={transformacion.id}
                className={
                  String(transformacionSeleccionada) === String(transformacion.id)
                    ? 'transformacion-boton activa'
                    : 'transformacion-boton'
                }
                onClick={() =>
                  setTransformacionSeleccionada(String(transformacion.id))
                }
              >
                {transformacion.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <img
        src={imagenActual}
        alt={nombreTransformacion === 'Base'
          ? personaje.name
          : nombreTransformacion}
        className="personaje-imagen"
      />

      <p>ID: {personaje.id}</p>

      <p>
        Ki: {kiActual}
      </p>

      <p>
        Raza: {personaje.race || 'Desconocida'}
      </p>

      <p>
        Planeta: {planeta || 'Desconocido'}
      </p>

      <p>
        Afiliación: {personaje.affiliation || 'Desconocida'}
      </p>

      <button type="button" onClick={toggleFavorito}>
        {esFavorito ? '❤️' : '🤍'}
      </button>
    </div>
  );
}

export default Personaje;