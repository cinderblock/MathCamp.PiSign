export default {
  remote: {
    connect: {
      username: 'pi',
      host: 'pisign',
    },
    directory: 'deploy',
    serviceName: 'lightd',
  },
  local: {
    basePath: '../',
    moduleDir: 'daemon',
  },
};
