// api/admin/login.js — Autenticación del panel admin
const { supabase } = require('../../lib/supabase');
const { generateAdminToken } = require('../../lib/auth');

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'podologiaparrilla@gmail.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin1234';

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Faltan credenciales' });

  // Verificar con tabla admin_users si supabase está disponible
  if (supabase) {
    const { data: user } = await supabase.from('admin_users').select('*').eq('email', email.toLowerCase()).eq('activo', true).single();
    if (!user) return res.status(401).json({ error: 'Credenciales incorrectas' });

    // En producción usar bcrypt. Aquí comparamos con ADMIN_PASSWORD por simplicidad
    if (password !== ADMIN_PASSWORD) return res.status(401).json({ error: 'Credenciales incorrectas' });

    await supabase.from('admin_users').update({ ultimo_acceso: new Date().toISOString() }).eq('id', user.id);
    const token = generateAdminToken(user);
    return res.json({ ok: true, token, user: { email: user.email, nombre: user.nombre, rol: user.rol } });
  }

  // Modo demo: credenciales hardcodeadas
  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    const user = { email, nombre: 'José Manuel', rol: 'admin' };
    const token = generateAdminToken(user);
    return res.json({ ok: true, token, user });
  }

  return res.status(401).json({ error: 'Credenciales incorrectas' });
}
