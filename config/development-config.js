//
// Edit this file if you are hosting a development
// instance of The Misinformation Game.
//

/**
 * This config allows you to enable or disable the development
 * mode of The Misinformation Game, and allows you to change
 * where the Firebase emulators are accessed from.
 *
 * Properties:
 * - developmentMode:
 *    = off: The Misinformation Game will never try to connect
 *           to the Firebase emulators.
 *    = auto: The Misinformation Game will connect to the
 *            Firebase emulators if the accessed browser address
 *            matches the developmentAddress.
 *            e.g. If you access "https://localhost:4000" and
 *            the developmentAddress is "localhost".
 *    = on: The Misinformation Game will always try to connect
 *          to the Firebase emulators.
 *
 * - developmentAddress: The address where the Firebase emulators
 *                       are hosted and can be accessed.
 */
const developmentConfig = {
    developmentMode: "auto",
    developmentAddress: "localhost"
};


// Do not edit this line.
export default developmentConfig;
