import { createServer } from 'http';
import { uptime } from 'os';

import chalk from 'chalk';
import SocketIO from 'socket.io';
import ServerStarter = require('server-starter');

let clientID = 0;

export default function setupClientSocket(eventHandlers: {
  [eventName: string]: (value: any, clientID: number) => void;
}) {
  // Helper function that is run every time a new webUI connects to us
  function setupClientSocket(sock: SocketIO.Socket) {
    const ID = clientID++;

    // TODO: Do we trust the proxy to set true `x-real-ip` header?
    const headers = sock.conn.request.headers;
    const address = headers['x-forwarded-for'] || headers['x-real-ip'] || sock.handshake.address;
    console.log(chalk.green('Client connected:'), chalk.cyan(address));

    // Give clients a our startup time once
    sock.emit('startuptime', Date.now() - uptime() * 1000);

    // Don't listen to client events for a sec on startup.
    // Ignores events that were "sent" after server shutdown (and are therefore still pending)
    setTimeout(() => {
      sock.on('event', ({ name, value, log }: { name: string; value: string | number | undefined; log: boolean }) => {
        if (log)
          console.log(
            chalk.grey('Event:'),
            chalk.cyan(name),
            '-',
            chalk.magenta(value === undefined ? 'value undefined' : (value as string))
          );
        const handler = eventHandlers[name];

        if (!handler) {
          console.log(chalk.red('No handler for event:'), chalk.magenta(name));
          return;
        }

        handler(value, ID);
      });
    }, 500);
  }

  const server = createServer();

  const sock = SocketIO(server, {
    serveClient: false,
    transports: ['websocket'],
    pingInterval: 1000,
  });

  // When a new client connects, setup handlers for the possible incoming commands
  sock.on('connection', setupClientSocket);

  ServerStarter(
    server,
    {
      listen: 8000,
      // listen: '/tmp/daemon.sock',
      // socketMode: 0o777,
      // socketOwner: {
      //   //user: 'pi',
      //   group: 'www-data',
      // },
    },
    (err, info, extra) => {
      if (err) {
        console.log(chalk.red('ERROR:'), err, info, extra);
      } else {
        // console.log('Listening:', info);
      }
    }
  );

  return { close: () => sock.close(), update: (state: State) => sock.volatile.emit('update', state) };
}
