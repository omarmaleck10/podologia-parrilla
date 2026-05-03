// api/reservas.js
// Vercel Serverless Function para manejar reservas
// Requiere: SUPABASE_URL y SUPABASE_SERVICE_KEY en variables de entorno

const { createClient } = require('@supabase/supabase-js');

const supabase = process.env.SUPABASE_URL
  ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)
  : null;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // ─── GET: listar reservas (solo admin) ───
  if (req.method === 'GET') {
    if (!supabase) {
      return res.status(200).json({ bookings: [], message: 'Demo mode - no database connected' });
    }

    const { data, error } = await supabase
      .from('reservas')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ bookings: data });
  }

  // ─── POST: crear reserva ───
  if (req.method === 'POST') {
    const { nombre, apellidos, telefono, email, servicio, fecha, hora, notas, precio } = req.body;

    if (!nombre || !apellidos || !telefono || !email || !servicio || !fecha || !hora) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    const booking = {
      nombre,
      apellidos,
      telefono,
      email,
      servicio,
      fecha,
      hora,
      notas: notas || '',
      precio: precio || null,
      estado: 'pendiente',
    };

    if (supabase) {
      const { data, error } = await supabase.from('reservas').insert(booking).select().single();
      if (error) return res.status(500).json({ error: error.message });

      // Enviar email de confirmacion (si Resend esta configurado)
      if (process.env.RESEND_API_KEY) {
        await sendConfirmationEmail(data);
      }

      return res.status(201).json({ booking: data, message: 'Reserva creada correctamente' });
    }

    // Demo: devolver sin persistir
    return res.status(201).json({
      booking: { id: 'demo-' + Date.now(), ...booking, created_at: new Date().toISOString() },
      message: 'Reserva registrada (modo demo)'
    });
  }

  // ─── PUT: actualizar estado ───
  if (req.method === 'PUT') {
    const { id, estado } = req.body;
    const validStates = ['pendiente', 'confirmada', 'realizada', 'cancelada'];

    if (!id || !validStates.includes(estado)) {
      return res.status(400).json({ error: 'ID o estado invalido' });
    }

    if (!supabase) {
      return res.status(200).json({ message: 'Estado actualizado (modo demo)' });
    }

    const { data, error } = await supabase
      .from('reservas')
      .update({ estado, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ booking: data });
  }

  return res.status(405).json({ error: 'Metodo no permitido' });
}

// ─── EMAIL DE CONFIRMACION ───
async function sendConfirmationEmail(booking) {
  try {
    const { Resend } = require('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);

    const fecha = new Date(booking.fecha + 'T12:00:00').toLocaleDateString('es-ES', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    await resend.emails.send({
      from: 'Podologia Parrilla <citas@podologiaparrilla.com>',
      to: booking.email,
      subject: `Solicitud de cita recibida - ${fecha} a las ${booking.hora}`,
      html: `
        <div style="font-family: 'Inter', sans-serif; max-width: 560px; margin: 0 auto; color: #1A1A1A;">
          <div style="background: #2C5F4A; padding: 32px; text-align: center;">
            <h1 style="color: white; font-size: 22px; margin: 0;">Podologia Parrilla</h1>
            <p style="color: rgba(255,255,255,0.7); margin: 8px 0 0; font-size: 14px;">Sevilla</p>
          </div>
          <div style="padding: 40px 32px; background: #F8F5F0;">
            <h2 style="font-size: 20px; margin-bottom: 16px;">Hola ${booking.nombre},</h2>
            <p style="color: #6B6560; margin-bottom: 24px; line-height: 1.7;">
              Hemos recibido tu solicitud de cita. Nos pondremos en contacto contigo en las proximas horas para confirmarla.
            </p>
            <div style="background: white; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
              <h3 style="font-size: 14px; text-transform: uppercase; letter-spacing: 0.06em; color: #6B6560; margin-bottom: 16px;">Resumen de tu cita</h3>
              <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #E0DAD2;">
                <span style="color: #6B6560; font-size: 14px;">Servicio</span>
                <span style="font-weight: 600; font-size: 14px;">${booking.servicio.split('—')[0].trim()}</span>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #E0DAD2;">
                <span style="color: #6B6560; font-size: 14px;">Fecha</span>
                <span style="font-weight: 600; font-size: 14px;">${fecha}</span>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 10px 0;">
                <span style="color: #6B6560; font-size: 14px;">Hora</span>
                <span style="font-weight: 600; font-size: 14px;">${booking.hora}</span>
              </div>
            </div>
            <p style="color: #6B6560; font-size: 14px; line-height: 1.7;">
              Si necesitas modificar o cancelar tu cita, llamanos al <strong>644 69 61 97</strong> o respondiendo a este email.
            </p>
          </div>
          <div style="padding: 24px 32px; text-align: center; border-top: 1px solid #E0DAD2;">
            <p style="font-size: 13px; color: #6B6560;">Calle Arroyo, 22 &mdash; Sevilla &mdash; 644 69 61 97</p>
          </div>
        </div>
      `
    });
  } catch (err) {
    console.error('Error enviando email:', err);
  }
}
