'use strict';

// Local dependencies
import * as debug from './utils/debug';
import makeClientHandler from './ClientHandler';

import WS281x from 'rpi-ws281x-native';

debug.green('Hello, world.');

const numPixels = 150;

WS281x.init(numPixels);
WS281x.setBrightness(255);

const buff = new Uint32Array(numPixels);

setInterval(() => {
  for (let i = 0; i < numPixels; i++) {
    buff[i] = 0;
  }

  WS281x.render(buff);
}, 1000 / 40);

// Events from the clients and how to handle them
const remoteControlServer = makeClientHandler({
  // This event happens when mobile devices report their orientation data to the server.
  // This could be very useful as a remote.
  // Careful, this event happens at ~60Hz
  // alpha = phone yaw 0-360 degrees.
  // beta  = phone pitch +/- 90 degrees
  // gamma = phone roll  +/- 90 degrees
  deviceorientation: ({ gamma }: { gamma: number }) => {
    // debug.log(gamma);
  },

  // Shut the whole thing down.
  Shutdown,
});

debug.green('Hello, world.');

function Shutdown() {
  setImmediate(() => {
    // Shutdown remote control server
    remoteControlServer.close();

    // Just kill the process in a short time in case we've forgotten to stop something...
    setTimeout(() => {
      debug.error('Something is still running...', 'Forcing a shutdown.');
      process.exit(0);
    }, 100).unref();
  });
}
