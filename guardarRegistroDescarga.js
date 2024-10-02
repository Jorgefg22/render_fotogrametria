const { pool } = require('./config');

async function guardarRegistroDescarga(registro) {
  const { usuario_id, ip, nombre_archivo, tamano_archivo, fecha_hora, resultado } = registro;
  try {
    await pool.query(
      `INSERT INTO descargas (usuario_id, ip, nombre_archivo, tamano_archivo, fecha_hora, resultado)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [usuario_id, ip, nombre_archivo, tamano_archivo, fecha_hora, resultado]
    );
  } catch (err) {
    console.error('Error al guardar el registro de descarga:', err);
  }
}

module.exports = guardarRegistroDescarga;