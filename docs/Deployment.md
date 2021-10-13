# Deployment
This guide outlines the step required to deploy your
own instanceof of The Misinformation Game on Firebase.

## 1. Installation of Required Tools
Deployment of this project requires the use of
[NPM](https://www.npmjs.com/) to install its dependencies.
A guide to install NPM can be found in the
[NPM Docs](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm).

Once you have NPM installed, open terminal and run the
following commands to download the source code of this
project, and install its dependencies,
```shell
cd [path/to/download/project/into]
git clone https://github.com/deanlawyw/CITS3200-Project
cd CITS3200-Project
npm install
sudo npm install -g firebase-tools
```
In the above commands, replace `[path/to/download/project/into]`
with a path to where you want the source code of the project
to be downloaded on your computer. The source code will be
created as a new directory in that path, so `~/Documents` is
a sensible option (i.e. `cd ~/Documents`).

## 2. Initialisation of Firebase
You will now need to create your own Firebase project,
and link it from the source code.

### 2.1. Creation of Firebase Project

#### 2.1.1. Create Project
Navigate to the
[Firebase Console](https://console.firebase.google.com/u/0/)
at https://console.firebase.google.com/u/0/ to create your
project. Make sure that you have the correct Google account
selected in the top-right of the page.

Click the **Add Project** button to create a new Firebase
project. This will open a screen where you can choose a
name for your deployment of The Misinformation Game. The
URL of your deployment is configured below the Project
Name input (it is small). Once prompted, you should
disable Google Analytics, and then continue.

#### 2.1.2. Enable Firestore Database
The Misinformation Game uses Firestore to store the
studies and their results, however it is not enabled
by default. To enable Firestore, navigate to
**Firestore Database** in the Firebase console and
click the **Create Database** button. You will then
be prompted to select a region to host the database.
For best results, choose a region that is close to
where users will access the game.

#### 2.1.3. Enable Google Authentication
The Misinformation Game uses Google accounts to
authenticate researchers so that only they can
access their studies. To enable Google Authentication,
navigate to **Authentication** in the Firebase console
and click the **Get started** button. You should now
be shown several **Sign-in providers**. Click on
**Google** underneath **Additional providers**,
and toggle it to **Enabled** in the top-right. You
will then need to set your **Project support email**
as a requirement for using Google SSO. Once you have
enabled Google Authentication and entered your project
support email, click Save in the bottom-right.

### 2.2. Add a Web App to your Firebase Project
Before you can connect the source code of your deployment
to your Firebase Project, you must create a Web App. There
should be an icon on the home-page that looks like `</>`
that you can use to create it.

Once you have started the process to add a web app, a dialog
should appear called **Add Firebase to your web app**. In
this dialog, enter your project name, and **tick yes** to
set up Firebase Hosting for the app. Once you have entered
your project name and selected yes to hosting, press the
**Register app** button.

You will now be shown several steps to set up the source
code of your Web App, however we have already done this
so all of these steps can be skipped.

### 2.3. Link your Web App in the source code
From the home-page of your Firebase console, navigate to
the project settings by selecting the cog wheel in the
top-left, and then **Project settings**.

![Project Settings Button](diagrams/project-settings.png)

If you scroll down on the **Project settings** page, you
should be able to find information about your Web App.
You need to find the section titled **SDK setup and
configuration**, and select **Config**.

![Config Button](diagrams/web-app-config.png)

You should now be shown a code snippet containing
your Firebase configuration object. It should
look similar to,
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyDbBqOrit6Kj3FUsmI3i3AOOu27PLtkwTM",
  authDomain: "misinformation-game.firebaseapp.com",
  projectId: "misinformation-game",
  storageBucket: "misinformation-game.appspot.com",
  messagingSenderId: "780788861427",
  appId: "1:780788861427:web:7f9b2b20c50e9b38cf6a86"
};
```

This configuration must be entered into the config file
in the source code that was downloaded in step 1.
Navigate to the source code that was downloaded. There
should be a directory named `config`, with a file
`firebase-config.js` inside. Open that file in a
text editor and replace the configuration object
within with your own configuration object. You should
only need to replace the lines that look like the code
snippet above, and you should not edit anything else in
the file.

### 2.4. Deploy the source code to your Firebase project
In the terminal, you should now run the following command
to sign-in your Firebase account,
```shell
firebase login
```

You should now be able to link to your Firebase app
using the following command, which will ask you to
select a Firebase project to use,
```shell
firebase use
```

Once you have selected your Firebase project, you
can then run the following commands to build and
deploy the website,
```shell
npm run build
firebase deploy
```

Your Firebase project should now be hosted at the URL
you set up in step 1!

# 3. Registration of Administrators
Before you can upload studies, you will need to register
your Google account as an administrator. A guide to register
users as administrators can be found in
[Administrators.md](Administrators.md).
