---
title: Development Environment
showPath: true
---

# Development Environment
This document describes how to set up your development
environment to work on The Misinformation Game and host
it locally for testing.

## 1. Install Dependencies
Similarly to when deploying the application, the NPM
dependencies for the project must be installed.
This can be done using the following commands from the
root directory of the project,
```shell
npm install
sudo npm install -g firebase-tools
npm run build
```

## 2. Connect to a Firebase Project
Firebase requires that you connect it to a Firebase
project just to run the project locally for testing.
You can create a new project by following the
**2.1.1.Create Project** section of the
[Installation Guide](/TechnicalInstallation). You do not
have to follow the guide any further to setup the
Firebase project, you just need one to exist.
However, if you already have a production Firebase
project, it is best to link to that project instead.

You can then link to your Firebase project by
running the following commands:
```shell
npx firebase login
npx firebase use --add
```

## 3. Run Firebase Emulators
The Firebase emulator will emulate the Firebase
authentication, Firestore, and Firebase Storage for
you. The emulator can be started by running the command,
```shell
npm run emulators
```

After you have run this command, you can access the
Firebase Emulator Suite backend at https://localhost:9000.
Every time you restart this emulator, all the data stored
within it will be discarded.

## 4. Run Development Website
While the Firebase Emulator provides its own hosting of
the website as well, using NPM to host the development
website is better, as it will update your website
instantly when you make changes. You can host your
development website using NPM by running the following
command,
```shell
npm start
```

You should now be able to access the development
website at https://localhost:3000. Any changes you make
to the source code should also be immediately reflected
in the page you are viewing.
