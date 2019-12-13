<script>
  import KongApi from './kong-api';
  import KongService from './kong-service';
  import Stores from './stores';

  const resources = ['acls', 'consumers', 'credentials', 'plugins', 'routes', 'services'];

  resources.forEach(resource => {
    KongApi[resource].list().then(({ data }) => Stores[resource].set(data));
  });

  const { acls, consumers, credentials, plugins, routes, services } = Stores;

  $: console.log({
    acls: $acls,
    consumers: $consumers,
    credentials: $credentials,
    plugins: $plugins,
    routes: $routes,
    services: $services,
  });

  let url = '';
  let path = '';
  let basicAuth = false;
  let username = '';
  let password = '';

  async function handleSubmit(event) {
    if (basicAuth && (!username || !password)) return;

    const { service, route } = await KongService.createRepoConfiguration(url, path);
    routes.update(s => [...s, route]);
    services.update(s => [...s, service]);

    if (basicAuth) {
      const {
        acl,
        aclPlugin,
        basicAuthPlugin,
        consumer,
        credential,
      } = await KongService.createBasicAuth(service, { username, password });

      acls.update(s => [...s, acl]);
      consumers.update(s => [...s, consumer]);
      credentials.update(s => [...s, credential]);
      plugins.update(s => [...s, aclPlugin, basicAuthPlugin]);
    }

    // Reset
    url = '';
    path = '';
    basicAuth = false;
    username = '';
    password = '';
  }

  async function remove(resource, id) {
    await KongApi[resource].delete(id);
    Stores[resource].update(ary => ary.filter(r => r.id !== id));
  }
</script>

<style>
  main {
    padding: 1em;
    max-width: 240px;
  }

  h1 {
    color: #ff3e00;
    text-transform: uppercase;
    font-size: 4em;
    font-weight: 100;
  }

  @media (min-width: 640px) {
    main {
      max-width: none;
    }
  }

  table {
    border: 1px solid black;
  }

  th,
  td {
    border: 1px solid black;
    padding: 0.5em;
  }

  th {
    background-color: lightgray;
    text-transform: capitalize;
  }

  input {
    padding: 0.5em;
  }

  button {
    cursor: pointer;
  }

  .warning {
    color: red;
  }
</style>

<main>
  <h1>Kong PoC</h1>
  <form on:submit|preventDefault={handleSubmit}>
    <label>Upstream Url</label>
    <input type="text" bind:value={url} required />
    <p>
      For localhost this must be:
      <code>http://host.docker.internal:PORT/...</code>
    </p>
    <label>External Path</label>
    <input type="text" bind:value={path} required />
    <p>
      Ex: A value of
      <code>federalist</code>
      will result in an external url of
      <code>https://federalist-kong.app.cloud.gov/federalist</code>
    </p>
    <label>
      Basic Auth?
      <input type="checkbox" bind:checked={basicAuth} />
    </label>
    <br />
    <br />
    {#if basicAuth}
      <label>Username</label>
      <input type="text" bind:value={username} />
      <label>Password</label>
      <input type="text" bind:value={password} />
      <br />
      <br />
    {/if}
    <button type="submit">Add</button>
  </form>

  <h2>Services</h2>
  <table>
    <thead>
      <tr>
        <th>url</th>
        <th>name</th>
        <th>id</th>
        <th />
      </tr>
    </thead>
    <tbody>
      {#each $services as service (service.id)}
        <tr>
          <td>{service.protocol}://{service.host}:{service.port}{service.path}</td>
          <td>{service.name ? service.name : ''}</td>
          <td>{service.id}</td>
          <td>
            <button class="warning" on:click={() => remove('services', service.id)}>X</button>
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
  <ul />

  <h2>Routes</h2>
  <table>
    <thead>
      <tr>
        <th>hosts</th>
        <th>paths</th>
        <th>name</th>
        <th>id</th>
        <th />
      </tr>
    </thead>
    <tbody>
      {#each $routes as route (route.id)}
        <tr>
          <td>{route.hosts.join(', ')}</td>
          <td>{(route.paths || []).join(', ')}</td>
          <td>{route.name ? route.name : ''}</td>
          <td>{route.id}</td>
          <td>
            <button class="warning" on:click={() => remove('routes', route.id)}>X</button>
          </td>
        </tr>
      {/each}
    </tbody>
  </table>

  <h2>Plugins</h2>
  <table>
    <thead>
      <tr>
        <th>name</th>
        <th>service id</th>
        <th>id</th>
        <th />
      </tr>
    </thead>
    <tbody>
      {#each $plugins as plugin (plugin.id)}
        <tr>
          <td>{plugin.name}</td>
          <td>{plugin.service.id}</td>
          <td>{plugin.id}</td>
          <td>
            <button class="warning" on:click={() => remove('plugins', plugin.id)}>X</button>
          </td>
        </tr>
      {/each}
    </tbody>
  </table>

  <h2>Consumers</h2>
  <table>
    <thead>
      <tr>
        <th>username</th>
        <th>id</th>
        <th />
      </tr>
    </thead>
    <tbody>
      {#each $consumers as consumer (consumer.id)}
        <tr>
          <td>{consumer.username}</td>
          <td>{consumer.id}</td>
          <td>
            <button class="warning" on:click={() => remove('consumers', consumer.id)}>X</button>
          </td>
        </tr>
      {/each}
    </tbody>
  </table>

  <h2>Credentials</h2>
  <table>
    <thead>
      <tr>
        <th>username</th>
        <th>password</th>
        <th>consumer id</th>
        <th>id</th>
      </tr>
    </thead>
    <tbody>
      {#each $credentials as credential (credential.id)}
        <tr>
          <td>{credential.username}</td>
          <td>{credential.password}</td>
          <td>{credential.consumer.id}</td>
          <td>{credential.id}</td>
        </tr>
      {/each}
    </tbody>
  </table>

  <h2>Acls</h2>
  <table>
    <thead>
      <tr>
        <th>group</th>
        <th>consumer id</th>
        <th>id</th>
      </tr>
    </thead>
    <tbody>
      {#each $acls as acl (acl.id)}
        <tr>
          <td>{acl.group}</td>
          <td>{acl.consumer.id}</td>
          <td>{acl.id}</td>
        </tr>
      {/each}
    </tbody>
  </table>
</main>
