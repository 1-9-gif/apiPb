const BASE = 'https://jsonplaceholder.typicode.com';

/** Centraliza el manejo de errores de TODAS las peticiones. */
async function pedir(ruta, opciones = {}) {
  const res = await fetch(`${BASE}${ruta}`, {
    headers: { 'Content-Type': 'application/json' },
    ...opciones,
  });

  if (!res.ok) {
    throw new Error(`Error ${res.status} al ${opciones.method ?? 'GET'} ${ruta}`);
  }

  // DELETE suele responder sin cuerpo
  if (res.status === 204) return null;

  return res.json();
}

// ---------- LEER ----------
export function listarPosts({ limite = 10, signal } = {}) {
  return pedir(`/posts?_limit=${limite}`, { signal });
}

export function obtenerPost(id, { signal } = {}) {
  return pedir(`/posts/${id}`, { signal });
}

// ---------- CREAR ----------
export function crearPost({ title, body, userId = 1 }) {
  return pedir('/posts', {
    method: 'POST',
    body: JSON.stringify({ title, body, userId }),
  });
}

// ---------- ACTUALIZAR ----------
/** PUT reemplaza el recurso completo. */
export function reemplazarPost(id, datos) {
  return pedir(`/posts/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ id, ...datos }),
  });
}

/** PATCH modifica solo los campos que envías. */
export function editarPost(id, cambios) {
  return pedir(`/posts/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(cambios),
  });
}

// ---------- BORRAR ----------
export function borrarPost(id) {
  return pedir(`/posts/${id}`, { method: 'DELETE' });
}
