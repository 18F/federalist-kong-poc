import Api from './kong-api';

async function createRepoConfiguration(url, path) {
  // Create a service pointing to the url
  const service = await Api.services.create({ url });

  // Create a route for the service
  const route = await Api.routes.create({
    hosts: ['federalist-kong.app.cloud.gov'],
    paths: [`/${path}`],
    service: { id: service.id },
  });

  return { service, route };
}

async function createBasicAuth(service, { username, password }) {
  // Create a consumer
  const consumer = await Api.consumers.create({
    username,
  });

  // Create credentials for consumer
  const credential = await Api.credentials.create({
    consumerIdOrName: consumer.id,
    username,
    password,
  });

  // Enable basic auth plugin
  const basicAuthPlugin = await Api.plugins.create({
    name: 'basic-auth',
    service: { id: service.id },
    config: {
      hide_credentials: true,
    },
  });

  const group = `${service.id}-group`;

  // Enable ACL plugin
  const aclPlugin = await Api.plugins.create({
    name: 'acl',
    service: { id: service.id },
    config: {
      hide_groups_header: true,
      whitelist: [group],
    },
  });

  // Add consumer to group
  const acl = await Api.acls.create({
    consumerIdOrName: consumer.id,
    group,
  });

  return {
    acl,
    aclPlugin,
    basicAuthPlugin,
    consumer,
    credential,
  };
}

export default {
  createRepoConfiguration,
  createBasicAuth,
};
