// api/reservas.js — GET lista reservas, POST nueva reserva
const { supabase } = require('../lib/supabase');
const { requireAdmin } = require('../lib/auth');
const { sendConfirmacionPaciente, sendNotificacionAdmin } = require('../lib/email');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  // GET — listar (admin only)
  if (req.method === 'GET') {
    const user = requireAdmin(req, res);
    if (!user) return;
    if (!supabase) return res.json({ reservas: [], demo: true });

    const { estado, fecha, q } = req.query;
    let query = supabase.from('reservas').select('*').order('fecha').order('hora');
    if (estado) query = query.eq('estado', estado);
    if (fecha)  query = query.eq('fecha', fecha);
    if (q)      query = query.or(`nombre.ilike.%${q}%,apellidos.ilike.%${q}%,email.ilike.%${q}%`);

    const { data, error } = await query;
    if (error) return res.status(500).json({ error: error.message });
    return res.json({ reservas: data });
  }

  // POST — crear reserva (público)
  if (req.method === 'POST') {
    const { nombre, apellidos, telefono, email, servicio, fecha, hora, notas, precio } = req.body;
    if (!nombre || !apellidos || !telefono || !email || !servicio || !fecha || !hora) {
      return res.status(400).json({ error: 'Faltan campos obligatorios.' });
    }

    const reserva = { nombre, apellidos, telefono, email, servicio, fecha, hora, notas: notas||'', precio: precio||null, estado: 'pendiente' };

    if (supabase) {
      // Comprobar si el slot ya está ocupado
      const { data: existentes } = await supabase.from('reservas').select('id').eq('fecha', fecha).eq('hora', hora).neq('estado','cancelada');
      if (existentes && existentes.length > 0) return res.status(409).json({ error: 'Ese horario ya está ocupado. Elige otro.' });

      const { data, error } = await supabase.from('reservas').insert(reserva).select().single();
      if (error) return res.status(500).json({ error: error.message });

      await sendConfirmacionPaciente(data).catch(console.error);
      await sendNotificacionAdmin(data).catch(console.error);
      return res.status(201).json({ ok: true, id: data.id });
    }

    // Modo demo
    await sendConfirmacionPaciente(reserva).catch(console.error);
    return res.status(201).json({ ok: true, id: 'demo-' + Date.now() });
  }

  res.status(405).json({ error: 'Método no permitido' });
}
