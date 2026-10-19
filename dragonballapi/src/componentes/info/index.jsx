import './style.css';
import InfoGuia from '/images/Infoguia.png';

function Info() {
  return (
    <main className="info-pagina">
      <section className="info-contenedor">
        <img
          className="info-imagen"
          src={InfoGuia}
          alt="Guia de la aplicacion Pokemon"
        />
      </section>
    </main>
  );
}

export default Info;