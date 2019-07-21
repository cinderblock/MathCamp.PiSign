'use strict';

// Local dependencies
import * as debug from './utils/debug';
import makeClientHandler from './ClientHandler';

import WS281x from 'rpi-ws281x-native';

import Koa from 'koa';
import Router from 'koa-router';

const koa = new Koa();
const app = new Router();

app.get('/:color', async ctx => {
  ctx.body = ctx.params.name;
  set(ctx.params.name);
});

koa.use(app.routes());
koa.listen(3000);

debug.green('Hello, world.');

const numPixels = 150;

WS281x.init(numPixels);
WS281x.setBrightness(255);

const maxBrightness = 1;
const maxRaw = 255;

export function curve(input: number) {
  input = Math.min(Math.max(input, 0), maxBrightness);
  return input && Math.round(Math.exp((Math.log(maxRaw) * input) / maxBrightness));
}

function set(color: string) {
  if (color == 'red') {
    const buff = new Uint32Array(numPixels);

    for (let i = 0; i < numPixels; i++) {
      buff[i] = (255 << 16) | (0 << 8) | (0 << 0);
    }

    // console.log('Start');
    WS281x.render(buff);
  } else {
    const buff = new Uint32Array(numPixels);

    for (let i = 0; i < numPixels; i++) {
      buff[i] = (255 << 16) | (255 << 8) | (255 << 0);
    }

    // console.log('Start');
    WS281x.render(buff);
  }
}
const startTime = Date.now();

set('white');

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
