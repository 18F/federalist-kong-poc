const KONG_ADMIN_URL = '__KONG_ADMIN_URL__';

const defaults = {
  headers: {
    'Content-Type': 'application/json',
  },
};

function send(path, method = 'GET', data) {
  const options = { ...defaults, method };
  if (data) options.body = JSON.stringify(data);

  return fetch(`${KONG_ADMIN_URL}${path}`, options).then(r => {
    if (!r.ok) throw new Error(`${r.status}: ${r.statusText}`);
    if (r.status === 200 || r.status === 201) return r.json();
    return '';
  });
}

function endpoints(path) {
  return {
    create(data) {
      return send(path, 'POST', data);
    },

    list() {
      return send(path);
    },

    delete(idOrName) {
      return send(`${path}/${idOrName}`, 'DELETE');
    },
  };
}

const credentials = {
  create({ consumerIdOrName, ...data }) {
    return endpoints(`/consumers/${consumerIdOrName}/basic-auth`).create(data);
  },
  list() {
    return endpoints(`/basic-auths`).list();
  },
};

const acls = {
  create({ consumerIdOrName, ...data }) {
    return endpoints(`/consumers/${consumerIdOrName}/acls`).create(data);
  },
  list() {
    return endpoints(`/acls`).list();
  },
};

export default {
  acls,
  credentials,
  consumers: endpoints('/consumers'),
  plugins: endpoints('/plugins'),
  routes: endpoints('/routes'),
  services: endpoints('/services'),
};
