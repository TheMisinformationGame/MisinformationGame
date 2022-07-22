---
title: Development Environment
showPath: true
showBackToTop: true
---

# Development Environment
{:#intro .no_toc}

This document describes how to set up your development environment to
work on The Misinformation Game and host it locally for testing. If you
would like to run the documentation website locally, see the
[Documentation Development Environment page](/DocsDevelopment).



## Table of Contents
{:#toc .no_toc}
* toc
{:toc}



## 1. Running the Development Environment on your Local Computer
{:#running-locally}

The default config files related to the development environment of
The Misinformation Game have all been pre-configured to run on your
local machine. If you wish to run the development environment on a
server, then you will need to update some config files to get that
to work. The process to run the development environment on another
server is described in the
[Development on an External Server section](#running-on-server).


### 1.1. Install Dependencies
{:#install-dependencies}

Similarly to when deploying The Misinformation Game, the NPM dependencies
for the project must be installed. This can be done using the following
commands from the root directory of the project,
```shell
npm install
sudo npm install -g firebase-tools
npm run build
```


### 1.2. Connect to a Firebase Project
{:#connect-firebase}

Firebase requires that you connect it to a Firebase project, even when
running the project locally for testing. You can create a new project by
following the **Create Project** section of the
[Installation Guide](/TechnicalInstallation). You do not have to follow
the guide any further to configure the Firebase project, you just need
one to exist. However, if you already have a production Firebase project,
it is best to link to that project instead.

Once you have created your Firebase project, you can link to it by
running the following commands:
```shell
npx firebase login
npx firebase use --add
```


### 1.3. Run Firebase Emulators
{:#run-emulators}

The Firebase emulators will emulate the Firebase authentication, database,
and storage for you. However, the state of these systems will not be saved
when the emulators are stopped and restarted. The emulators can be started
by running the command,
```shell
npm run emulators
```

After you have run this command, you can access the Firebase Emulator Suite
backend at https://localhost:9000. Every time you restart this emulator, all
the data stored within it will be discarded.


### 1.4. Run Development Website
{:#run-website}

While the Firebase Emulator provides its own hosting of the website, using
NPM to host the development website is advised, as it will update your website
as you make code changes. You can host your development website using NPM by
running the following command,
```shell
npm start
```

You should now be able to access the development
website at https://localhost:3000. Any changes you make
to the source code should also be immediately reflected
in the page you are viewing.



## 2. Development on an External Server
{:#running-on-server}

If you wish to run the development environment on an external server, you will
need to update a couple of config files to update how The Misinformation Game
will access the Firebase emulators,

1. **[config/development-config.js](https://github.com/TheMisinformationGame/MisinformationGame/blob/main/config/development-config.js):**
   The development config allows you to set the `developmentAddress` property to a value
   other than localhost. You will need to update this property to the IP address of your
   server, to inform The Misinformation Game about where to connect to the emulators.
2. **[firebase.json](https://github.com/TheMisinformationGame/MisinformationGame/blob/main/firebase.json):**
   The Firebase config contains the addresses where the Firebase emulators will be hosted
   at the bottom of the file. These values will be `127.0.0.1` by default (i.e., localhost).
   You will need to update these values to either `0.0.0.0` or the IP address of your server,
   so that the emulators are made available to The Misinformation Game clients.
