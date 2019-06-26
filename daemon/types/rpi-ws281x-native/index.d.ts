// Type definitions for rpi-ws281x-native
// Project:
// Definitions by: Cameron Tacklind <cameron@tacklind.com> (https://github.com/cinderblock)
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

declare module 'rpi-ws281x-native' {
  import { EventEmitter } from 'events';
  export type PixelMapHandler = (data: Uint32Array) => void;

  export default class ws281x extends EventEmitter {
    /**
     * configures PWM and DMA for sending data to the LEDs.
     *
     * @param {Number} numLeds  number of LEDs to be controlled
     * @param {?Object} options  (acutally only tested with default-values)
     *                           intialization-options for the library
     *                           (PWM frequency, DMA channel, GPIO, Brightness)
     */
    static init(numLeds: number, options?: any): void;

    /**
     * register a mapping to manipulate array-indices within the
     * data-array before rendering.
     *
     * @param {Array.<Number>} map  the mapping, indexed by destination.
     */
    static setIndexMapping(map: number[]): void;

    /**
     * set the overall-brightness for the entire strip.
     * This is a fixed scaling applied by the driver when
     * data is sent to the strip
     *
     * @param {Number} brightness the brightness, value from 0 to 255.
     */
    static setBrightness(brightness: number): void;

    /**
     * send data to the LED-strip.
     *
     * @param {Uint32Array} data  the pixel-data, 24bit per pixel in
     *                            RGB-format (0xff0000 is red).
     */
    static render: PixelMapHandler;

    /**
     * clears all LEDs, resets the PWM and DMA-parts and deallocates
     * all internal structures.
     */
    static reset(): void;

    /**
     * emitted just before the data is prepared and sent to the LED-driver. The handler will receive the pixel-data array (an Uint32Array) as single argument. As this event is handled synchronously, you can use this to manipulate the data before it is sent to the LED-Strip.
     * @param event
     * @param handler
     */
    static on(event: 'beforeRender', handler: PixelMapHandler): void;
    static removeListener(event: 'beforeRender', handler: PixelMapHandler): void;

    // In addition to that, the exported object is an EventEmitter that will emit the following Events:

    /**
     * emitted after the data has been sent to the LED-Strip. The single argument passed to the handler is the final pixel-data array, after index-remapping and gamma-correction.
     * @param event
     * @param handler
     */

    static on(event: 'render', handler: PixelMapHandler): void;
    static removeListener(event: 'render', handler: PixelMapHandler): void;
  }
}
