import React from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Modo "sitio en construcción".
 *
 * Mientras MAINTENANCE_MODE sea true, quien entre a la tienda ve SOLO la imagen
 * de "Sitio en construcción" (no hay navegación, carrito ni checkout), así nadie
 * puede comprar mientras se releva precios y stock en el local.
 *
 * - El panel /admin sigue accesible para poder actualizar precios y stock.
 * - Para ver la tienda completa (revisión interna) entrar una vez a cualquier
 *   página con  ?vista-previa  (queda activo en esa pestaña hasta cerrarla).
 *   Para salir de la vista previa:  ?vista-previa=off
 *
 * Para reabrir la tienda: poner MAINTENANCE_MODE = false y volver a desplegar.
 * Nada del sitio se borra ni se modifica: solo se antepone esta pantalla.
 */
export const MAINTENANCE_MODE = true;

const PREVIEW_KEY = 'iv_maintenance_preview';
// Imagen horizontal (escritorio / celular acostado) y vertical (celular parado).
const IMAGE_DESKTOP = '/en-construccion-desktop.webp';
const IMAGE_MOBILE = '/en-construccion-mobile.webp';
const IMAGE_ALT =
  'Imperio Verde Growshop — Sitio en construcción. Estamos terminando de armar el resto de la web y actualizando precios. Gracias por tu paciencia.';

/** Elige la imagen vertical cuando la pantalla es más alta que ancha. */
const ConstructionPicture: React.FC<{ alt: string; style: React.CSSProperties }> = ({ alt, style }) => (
  <picture style={{ display: 'contents' }}>
    <source media="(orientation: portrait)" srcSet={IMAGE_MOBILE} />
    <img src={IMAGE_DESKTOP} alt={alt} aria-hidden={alt === '' ? true : undefined} style={style} />
  </picture>
);

const readPreviewFlag = (search: string): boolean => {
  try {
    const params = new URLSearchParams(search);
    if (params.has('vista-previa')) {
      if (params.get('vista-previa') === 'off') {
        sessionStorage.removeItem(PREVIEW_KEY);
      } else {
        sessionStorage.setItem(PREVIEW_KEY, '1');
      }
    }
    return sessionStorage.getItem(PREVIEW_KEY) === '1';
  } catch {
    // sessionStorage bloqueado: sin vista previa, se muestra el cartel.
    return false;
  }
};

export const MaintenanceGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { pathname, search } = useLocation();

  if (!MAINTENANCE_MODE) return <>{children}</>;
  if (pathname.startsWith('/admin')) return <>{children}</>;
  if (readPreviewFlag(search)) return <>{children}</>;

  return (
    <main
      role="main"
      aria-label="Sitio en construcción"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        background: '#06180f',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Fondo: la misma imagen, desenfocada y a pantalla completa (sin franjas vacías) */}
      <ConstructionPicture
        alt=""
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          filter: 'blur(28px) brightness(0.7)',
          transform: 'scale(1.1)',
        }}
      />
      {/* Imagen completa, sin recortar, en cualquier pantalla */}
      <ConstructionPicture
        alt={IMAGE_ALT}
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          objectFit: 'contain',
        }}
      />
    </main>
  );
};
