const testKitEnv = require('./environment');

(async () => {
  const { bmApp, app } = await testKitEnv.environment();
  await bmApp.start();
  await app.start();

  // We need to stop the testkit explicitly, since it's running in a different process
  const stopTestKit = () => {
    bmApp.stop();
    app.stop();
  };

  const signals: Array<'SIGINT' | 'SIGUSR1' | 'SIGUSR2'> = [
    'SIGINT',
    'SIGUSR1',
    'SIGUSR2',
  ];

  signals.forEach(ev => process.on(ev, stopTestKit));

  process.on('uncaughtException', stopTestKit);
  process.on('exit', stopTestKit);
})();
