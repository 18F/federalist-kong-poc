import { writable } from 'svelte/store';

export const acls = writable([]);
export const consumers = writable([]);
export const credentials = writable([]);
export const plugins = writable([]);
export const routes = writable([]);
export const services = writable([]);

export default {
  acls,
  consumers,
  credentials,
  plugins,
  routes,
  services,
};
