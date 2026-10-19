import { useState, useEffect, useCallback, useRef } from 'react';
import './style.css';

const API_URL = 'https://dragonball-api.com/api/characters?page=1&limit=100';

// Convierte el Ki de la API en un número comparable.
// No utiliza maxKi.
function convertirKiAValor(ki) {
  if (ki === null || ki === undefined) return null;

  const texto = String(ki)
    .toLowerCase()
    .replace(/,/g, '')
    .trim();

  if (/infinite|infinity|infinito|∞/.test(texto)) {
    return Infinity;
  }

  const coincidencia = texto.match(
    /(\d+(?:\.\d+)?)\s*(thousand|million|billion|trillion|quadrillion|quintillion|sextillion|septillion|octillion|nonillion)?/
  );

  if (!coincidencia) return null;

  const magnitudes = {
    thousand: 1e3,
    million: 1e6,
    billion: 1e9,
    trillion: 1e12,
    quadrillion: 1e15,
    quintillion: 1e18,
    sextillion: 1e21,
    septillion: 1e24,
    octillion: 1e27,
    nonillion: 1e30
  };

  const cantidad = Number(coincidencia[1]);
  const magnitud = magnitudes[coincidencia[2]] || 1;

  return cantidad * magnitud;
}

// Escoge dos formas diferentes para la ronda.
function crearRonda(formas) {
  if (!formas || formas.length < 2) return [];

  const primera = Math.floor(Math.random() * formas.length);
  let segunda = Math.floor(Math.random() * formas.length);

  while (segunda === primera) {
    segunda = Math.floor(Math.random() * formas.length);
  }

  return [formas[primera], formas[segunda]];
}

function Juego() {
  const [formas, setFormas] = useState([]);
  const [ronda, setRonda] = useState([]);
  const [racha, setRacha] = useState(0);
  const [mejorRacha, setMejorRacha] = useState(() => {
    return Number(localStorage.getItem('mejorRachaKi') || 0);
  });

  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [seleccionada, setSeleccionada] = useState(null);
  const [resultado, setResultado] = useState('');
  const [finDelJuego, setFinDelJuego] = useState(false);

  const temporizador = useRef(null);

  const cargarPersonajes = useCallback(async () => {
    setCargando(true);
    setError('');

    try {
      let pagina = 1;
      let totalPaginas = 1;
      let personajes = [];

      while (pagina <= totalPaginas) {
        const respuesta = await fetch(
          `https://dragonball-api.com/api/characters?page=${pagina}&limit=100`
        );

        if (!respuesta.ok) {
          throw new Error('No se pudieron cargar los personajes.');
        }

        const datos = await respuesta.json();

        const personajesPagina = Array.isArray(datos)
          ? datos
          : datos.items || [];

        personajes = [...personajes, ...personajesPagina];

        totalPaginas = datos.meta?.totalPages || 1;
        pagina++;
      }

      // Cada personaje se convierte en una forma base y,
      // cuando existen, en sus transformaciones.
      const formasDisponibles = personajes.flatMap((personaje) => {
        const formasPersonaje = [
          {
            clave: `${personaje.id}-base`,
            id: personaje.id,
            nombre: personaje.name,
            transformacion: 'Base',
            imagen: personaje.image,
            ki: personaje.ki
          }
        ];

        const transformaciones = Array.isArray(personaje.transformations)
          ? personaje.transformations
          : [];

        transformaciones.forEach((transformacion) => {
          formasPersonaje.push({
            clave: `${personaje.id}-${transformacion.id}`,
            id: personaje.id,
            nombre: personaje.name,
            transformacion: transformacion.name,
            imagen: transformacion.image,
            ki: transformacion.ki
          });
        });

        return formasPersonaje;
      });

      // Se excluyen formas sin imagen o sin un Ki comparable.
      const formasValidas = formasDisponibles
        .map((forma) => ({
          ...forma,
          valorKi: convertirKiAValor(forma.ki)
        }))
        .filter(
          (forma) =>
            forma.imagen &&
            forma.valorKi !== null &&
            !Number.isNaN(forma.valorKi)
        );

      if (formasValidas.length < 2) {
        throw new Error(
          'La API no devolvió suficientes formas con imagen y Ki válido.'
        );
      }

      setFormas(formasValidas);
      setRonda(crearRonda(formasValidas));
      setRacha(0);
      setSeleccionada(null);
      setResultado('');
      setFinDelJuego(false);
    } catch (errorCarga) {
      console.error('Error al cargar Dragon Ball API:', errorCarga);
      setError(
        'No se pudieron cargar los personajes. Comprueba tu conexión e inténtalo de nuevo.'
      );
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarPersonajes();

    return () => {
      if (temporizador.current) {
        clearTimeout(temporizador.current);
      }
    };
  }, [cargarPersonajes]);

  const elegirForma = (forma) => {
    if (seleccionada || finDelJuego || ronda.length !== 2) return;

    setSeleccionada(forma.clave);

    const otraForma = ronda.find(
      (elemento) => elemento.clave !== forma.clave
    );

    const correcto = forma.valorKi >= otraForma.valorKi;

    if (correcto) {
      setResultado('correcto');

      const nuevaRacha = racha + 1;
      setRacha(nuevaRacha);

      if (nuevaRacha > mejorRacha) {
        setMejorRacha(nuevaRacha);
        localStorage.setItem('mejorRachaKi', String(nuevaRacha));
      }

      temporizador.current = setTimeout(() => {
        setRonda(crearRonda(formas));
        setSeleccionada(null);
        setResultado('');
      }, 1100);
    } else {
      setResultado('incorrecto');
      setFinDelJuego(true);
    }
  };

  const reintentar = () => {
    if (temporizador.current) {
      clearTimeout(temporizador.current);
    }

    setRacha(0);
    setSeleccionada(null);
    setResultado('');
    setFinDelJuego(false);
    setRonda(crearRonda(formas));
  };

  if (cargando) {
    return (
      <main className="juego">
        <p className="juego-mensaje">Cargando guerreros...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="juego">
        <p className="juego-mensaje">{error}</p>
        <button
          type="button"
          className="juego-reintentar"
          onClick={cargarPersonajes}
        >
          Reintentar
        </button>
      </main>
    );
  }

  return (
    <main className="juego">
      <header className="juego-cabecera">
        <h2>¿Quién tiene más KI?</h2>

        <div className="juego-racha">
          <div>
            <span>RACHA: </span>
            <strong>{racha}</strong>
          </div>

          <div>
            <span>RECORD: </span>
            <strong>{mejorRacha}</strong>
          </div>
        </div>
      </header>

      <section className="juego-personajes">
        {ronda.map((forma) => {
          let claseResultado = '';

          if (seleccionada && resultado === 'correcto') {
            if (forma.clave === seleccionada) {
              claseResultado = 'juego-correcto';
            }
          }

          if (seleccionada && resultado === 'incorrecto') {
            if (forma.clave === seleccionada) {
              claseResultado = 'juego-incorrecto';
            }
          }

          return (
            <button
              type="button"
              key={forma.clave}
              className={`juego-tarjeta ${claseResultado}`}
              onClick={() => elegirForma(forma)}
              disabled={Boolean(seleccionada) || finDelJuego}
            >
              <span className="juego-nombre">{forma.nombre}</span>

              <span className="juego-transformacion">
                {forma.transformacion}
              </span>

              <div className="juego-imagen-contenedor">
                <img
                  src={forma.imagen}
                  alt={`${forma.nombre} ${forma.transformacion}`}
                  className="juego-imagen"
                />
              </div>

              <span className="juego-ki">
                {seleccionada
                  ? `KI: ${forma.ki}`
                  : 'KI: ???'}
              </span>
            </button>
          );
        })}
      </section>

      {resultado === 'correcto' && (
        <div className="juego-estimulo juego-estimulo-verde">
          ¡CORRECTO!
        </div>
      )}

      {resultado === 'incorrecto' && (
        <div className="juego-estimulo juego-estimulo-rojo">
          ¡INCORRECTO!
        </div>
      )}

      {finDelJuego && (
        <section className="juego-fin">
          <p>Tu racha final: {racha}</p>

          <button
            type="button"
            className="juego-reintentar"
            onClick={reintentar}
          >
            Reintentar
          </button>
        </section>
      )}
    </main>
  );
}

export default Juego;