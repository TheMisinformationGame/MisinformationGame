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
git clone https://github.com/TheMisinformationGame/MisinformationGame
cd MisinformationGame
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

### 2.4. Deploy your Firebase project
The Misinformation Game has the helper script
[deploy.sh](/deploy.sh) to help deploying your
Firebase project. It can be run using the following
command from within the MisinformationGame directory,
```shell
./deploy.sh
```

This script will take you through several steps to
install dependencies, initialise your project, and
deploy it to your live website.

#### 2.4.1. Installing Dependencies

```
==========================
Installing dependencies...
==========================
```
This step may take some time to install all the
dependencies of The Misinformation Game using
NPM.

#### 2.4.2. Installing Firebase
```
=============================================================
Installing Firebase, you may be prompted for your password...
=============================================================
```
Firebase requires some more permissions to be
installed, and therefore this step may ask you
for your password.

#### 2.4.3. Installing Google Cloud SDK
```
==================================
Installing the Google Cloud SDK...
==================================
```
This step will download and install the Google Cloud
SDK that will later be used to configure the CORS
settings for the storage of images in the app.

If you don't have Python 3 installed, you may be
prompted for your password so that it can be
installed.

#### 2.4.4. Connect to Firebase
```
=========================================================
Connecting to Firebase, you may be prompted to sign in...
=========================================================
```
This step will prompt you to log in to your Firebase
account, so that the Firebase project you created can
be accessed.

You may also be prompted to allow Firebase to collect
CLI usage and error reporting information. You can just
press enter to accept it, or you could type `n` and enter
to deny this analytics collection.

#### 2.4.5. Select Firebase Project
```
=================================================================
Please select the Firebase project you would like to deploy to...
=================================================================
```
This step will ask you to select the Firebase project
you created, so that we can deploy the website to the
project.

#### 2.4.6. Building the Application
```
echo "==========================="
echo "Building the application..."
echo "==========================="
```
This step will build the application so that it can be
deployed. This step may take some time.

#### 2.4.7. Deploying to Firebase
```
========================================
Deploying the application to Firebase...
========================================
```
This step will deploy your application to your
Firebase project! After this step, you will be able
to access your website from its .web.app domain.
However, the game will not function correctly as
the website will not be able to load the avatars
of sources, or the images for posts.

#### 2.4.8. Initialise Google Cloud
```
============================
Initialising Google Cloud...
============================
```
This step will ask you to initialise the Google
Cloud SDK to point to your account and project.
You will be prompted for several inputs through
this process.

**Step 1:** You may be asked to pick a configuration
to use. If you are asked, then select the option to
`Re-initialize this coniguration`.

**Step 2:** You will be asked whether you
would like to log in. If you are already signed in,
you may select your account. Otherwise, press
enter to state that you would like to log in.

**Step 3:** If you were not already signed in,
a browser should be opened where
you can log in to the same account you use
for your Firebase console. If your browser is
not automatically opened, there should be a URL
in the terminal that you can copy into a
web-browser.

_Copying from Terminal Warning:_ Be careful
about typing Cmd-C or Ctrl-C in Terminal, as this will
quit the script. Instead, often Terminals use
Cmd-Shift-C or Ctrl-Shift-C instead to copy values.

**Step 4:** You will next be asked to pick a cloud
project to use. Enter the number in square brackets
next to the name of your Firebase project.

#### 2.4.9. Uploading the CORS settings
```
===============================================
Setting up the CORS settings for the website...
===============================================
```
This step will update the CORS settings of your
website so that the images for sources and posts
can be loaded. You will be prompted for your
project's .appspot.com domain. This domain is the
same as your .web.app domain, just with a different
extension. For example, for the example website for
this project, misinformation-game.web.app, you would
have to enter misinformation-game.appspot.com.

#### 2.4.10. Complete!
```
======================
Successfully Deployed!
======================
```
Your Firebase project should now be hosted at the URL
you set up in step 1!

# 3. Registration of Administrators
Before you can upload studies, you will need to register
your Google account as an administrator. A guide to register
users as administrators can be found in
[Administrators.md](Administrators.md).
