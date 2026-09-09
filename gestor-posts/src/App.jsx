import { useState, useEffect } from 'react';
import { listarPosts, crearPost, borrarPost, editarPost } from './api/posts.js';

export default function App() {
  const [posts, setPosts]         = useState([]);
  const [cargando, setCargando]   = useState(true);
  
  // Estados para CREAR (POST)
  const [titulo, setTitulo]       = useState('');
  const [cuerpo, setCuerpo]       = useState('');
  const [guardando, setGuardando] = useState(false);
  const [errorForm, setErrorForm] = useState(null);

  // Estados para EDITAR (PATCH)
  const [editando, setEditando] = useState(null); // Guarda el ID del post en edición
  const [borrador, setBorrador] = useState('');   // Guarda el texto temporal

  // 1. LEER: Cargar los posts iniciales
  useEffect(() => {
    listarPosts({ limite: 5 })
      .then(data => setPosts(data))
      .catch(err => console.error(err))
      .finally(() => setCargando(false));
  }, []);

  // 2. CREAR: Enviar nuevo post
  async function enviar(evento) {
    evento.preventDefault();
    setGuardando(true);
    setErrorForm(null);

    try {
      const creado = await crearPost({ title: titulo, body: cuerpo });
      setPosts(actuales => [creado, ...actuales]);
      setTitulo('');
      setCuerpo('');
    } catch (e) {
      setErrorForm(e.message);
    } finally {
      setGuardando(false);
    }
  }

  // 3. BORRAR: Estrategia Optimista
  async function eliminar(id) {
    const respaldo = posts; // 1. guarda el estado actual

    setPosts(actuales => actuales.filter(p => p.id !== id)); // 2. quita YA de la pantalla

    try {
      await borrarPost(id); // 3. confirma con el servidor
    } catch (e) {
      setPosts(respaldo); // 4. si falla, revierte
      alert(`No se pudo borrar: ${e.message}`);
    }
  }

  // 4. EDITAR: Funciones del patrón "borrador"
  function empezarEdicion(post) {
    setEditando(post.id);
    setBorrador(post.title);
  }

  async function guardarEdicion(id) {
    try {
      // PATCH: mandamos SOLO el campo que cambió
      const actualizado = await editarPost(id, { title: borrador });

      setPosts(actuales =>
        actuales.map(p => (p.id === id ? { ...p, ...actualizado } : p))
      );

      setEditando(null); // Salimos del modo edición
    } catch (e) {
      alert(`No se pudo guardar: ${e.message}`);
    }
  }

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: '600px', margin: '0 auto' }}>
      <h1>📝 Gestor de Posts</h1>

      {/* Formulario de Creación */}
      <section style={{ background: '#f5f5f5', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem' }}>
        <h2>Crear Publicación</h2>
        <form className="formulario" onSubmit={enviar} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <input
            value={titulo}
            onChange={e => setTitulo(e.target.value)}
            placeholder="Título del post"
            style={{ padding: '0.8rem' }}
          />
          <textarea
            value={cuerpo}
            onChange={e => setCuerpo(e.target.value)}
            placeholder="Contenido…"
            rows="3"
            style={{ padding: '0.8rem' }}
          />
          {errorForm && <p style={{ color: 'red' }}>⚠️ {errorForm}</p>}
          <button 
            type="submit" 
            disabled={guardando || titulo.trim().length < 3}
            style={{ padding: '0.8rem', cursor: guardando ? 'wait' : 'pointer' }}
          >
            {guardando ? 'Guardando…' : 'Publicar'}
          </button>
        </form>
      </section>

      {/* Feed de Posts */}
      <section>
        <h2>Feed de Publicaciones</h2>
        
        {cargando ? <p>Cargando posts...</p> : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {posts.map(post => (
              <article key={post.id} className="post" style={{ borderBottom: '1px solid #eee', padding: '1rem 0' }}>
                
                {/* ¿Estamos editando ESTE post en particular? */}
                {editando === post.id ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <input 
                      value={borrador} 
                      onChange={e => setBorrador(e.target.value)} 
                      style={{ padding: '0.5rem', fontSize: '1.1rem', fontWeight: 'bold' }}
                    />
                    <div className="acciones" style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => guardarEdicion(post.id)} style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}>Guardar</button>
                      <button onClick={() => setEditando(null)} style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}>Cancelar</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h3 style={{ margin: '0 0 0.5rem 0' }}>#{post.id} - {post.title}</h3>
                    <p style={{ margin: '0 0 1rem 0', color: '#666' }}>{post.body}</p>
                    <div className="acciones" style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => empezarEdicion(post)} style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}>Editar</button>
                      <button onClick={() => eliminar(post.id)} style={{ padding: '0.5rem 1rem', background: '#ff4d4f', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Borrar</button>
                    </div>
                  </>
                )}

              </article>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}