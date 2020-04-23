const testKitEnv = require('./environment');

(async () => {
  const { env, app } = await testKitEnv.environment();
  await env.start();
  await app.start();

  // We need to stop the testkit explicitly, since it's running in a different process
  const stopTestKit = () => {
    env.stop();
    app.stop();
  };

  const signals = ['SIGINT', 'SIGUSR1', 'SIGUSR2'];

  signals.forEach(ev => process.on(ev, stopTestKit));

  process.on('uncaughtException', stopTestKit);
  process.on('exit', stopTestKit);
})();
