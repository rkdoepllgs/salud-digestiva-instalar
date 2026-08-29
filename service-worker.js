const CACHE =
  "salud-digestiva-installer-v3";

const ASSETS = [
  "./icon-192.png",
  "./icon-512.png",
  "./icon-maskable-512.png"
];


/* =========================================================
   INSTALACIÓN
   ========================================================= */

self.addEventListener(
  "install",
  event => {

    event.waitUntil(
      caches
        .open(CACHE)
        .then(cache => cache.addAll(ASSETS))
    );

    self.skipWaiting();

  }
);


/* =========================================================
   ACTIVACIÓN
   Borra versiones anteriores del caché
   ========================================================= */

self.addEventListener(
  "activate",
  event => {

    event.waitUntil(

      caches
        .keys()
        .then(keys =>

          Promise.all(

            keys
              .filter(key => key !== CACHE)
              .map(key => caches.delete(key))

          )

        )

    );

    self.clients.claim();

  }
);


/* =========================================================
   PETICIONES
   ========================================================= */

self.addEventListener(
  "fetch",
  event => {

    if (event.request.method !== "GET") {
      return;
    }

    /*
      MUY IMPORTANTE:

      Las páginas HTML y las navegaciones NO se sirven
      desde caché.

      Así evitamos que aparezca una versión antigua del
      instalador al abrir Salud Digestiva.
    */

    if (event.request.mode === "navigate") {
      return;
    }

    const url =
      new URL(event.request.url);

    /*
      No interferimos con otros dominios.
    */

    if (url.origin !== self.location.origin) {
      return;
    }

    /*
      Para recursos estáticos como los iconos:
      caché primero y red como respaldo.
    */

    event.respondWith(

      caches
        .match(event.request)
        .then(cached => {

          return (
            cached ||
            fetch(event.request)
          );

        })

    );

  }
);
