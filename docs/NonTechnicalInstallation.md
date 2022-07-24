---
title: Non-Technical Installation Guide
showPath: true
showBackToTop: true
---

# Installation (Non-Technical Guide)
{:#intro .no_toc}

This document outlines a step-by-step process to install and host your own instance of the Misinformation
Game. At the end of this guide, you will have your own website to use to run studies using the Misinformation
Game software.

This guide is aimed to require less technical knowledge than the
[technical installation guide](/TechnicalInstallation), and as such it requires more time and has a few
limitations. One major limitation of this process is that it does not allow easily updating the Misinformation
Game as explained in the [updating guide](/Updating). Instead, this same process will need to be followed
again to update your instance. If you are comfortable installing software and using the command line,
then the technical installation guide will likely be easier and quicker to follow.



## Table of Contents
{:#toc .no_toc}
* toc
{:toc}



## 1. Download the Codebase From GitHub
{:#download-codebase}

The Misinformation Game must be deployed using its source code. To download and save the codebase onto your
device, you can access it from [GitHub](https://github.com/TheMisinformationGame/MisinformationGame).

On this page you will need to click on the green _“Code”_ button and then on the _“Download Zip”_ button as
seen in <a href="#fig1">Figure 1</a>. This will then prompt you to download a zip file of the code,
which you can save anywhere on your computer. The Zip archive should then be extracted into a folder on your
device, which will contain the source code of the Misinformation Game to use in future steps.

<figure id="fig1">
    <img src="diagrams/non-technical-installation-guide/1-download-codebase.png" alt="figure 1" height="557" />
    <figcaption>
        <a href="#fig1">Figure 1.</a> Downloading the source code from GitHub.
    </figcaption>
</figure>



## 2. Install Visual Studio Code
{:#install-vscode}

_If you already have Visual Studio Code installed, then you may skip this step._

This installation guide demonstrates the installation process of downloading the Visual Studio Code on
Windows. Should you be using a Mac, the installation process should be similar, but in case you encounter
any difficulties, you can follow the
[Visual Studio Code installation guide for Mac](https://code.visualstudio.com/docs/setup/mac).

**Step 1:** Download Visual Studio Code from [the Visual Studio Code website](https://code.visualstudio.com/download).

**Step 2:** Open the downloaded file to begin the installation process.

**Step 3:** Read the license agreement and click **Next** if you agree.

**Step 4:** On the _'Select Destination Location'_ page, click **Next**.

**Step 5:** On the _'Select Start Menu Folder'_ page, click **Next**.

**Step 6:** On the _'Additional Tasks'_ page, select **"Add to PATH (requires shell restart)"**,
and then click **Next**.

**Step 7:** On the _'Ready to Install'_ page, click **Install**. Once the installation has
been completed, you may progress to section 3 of this guide.



## 3. Install Node.js and NPM
{:#install-nodejs}

The next step in the process is to download [Node.js](https://nodejs.org) and [NPM](https://www.npmjs.com/).
The former is required to run the installation code, and the latter is required to install dependencies of
the Misinformation Game.

**Step 1:** Download the installer for both of these tools from
[https://nodejs.org/en/download/](https://nodejs.org/en/download/).
Select the platform-specific installer you require by clicking the **"Windows Installer"**
or the **"macOS Installer"** buttons on the download page. The **"Windows Installer"** button
is highlighted in <a href="#fig2">Figure 2</a>.

<figure id="fig2">
    <img src="diagrams/non-technical-installation-guide/2-download-nodejs-installer.png" alt="figure 2" height="360" />
    <figcaption>
        <a href="#fig2">Figure 2.</a> Downloading the Windows installer of Node.js.
    </figcaption>
</figure>

**Step 1:** Once the installer has downloaded, run it.

**Step 2:** If you are asked whether you wish to run the software, then accept by clicking **“Run”**.

**Step 3:** Begin the installation by clicking **Next**.

**Step 4:** Read the license agreement and click **Next** if you agree.

**Step 5:** On the _'Installation Location'_ page, click **Next**.

**Step 6:** The next page will ask you to select the components that you wish to install.
The default selections include all the components we require, so click **Next**.

**Step 7:** Click **Install**. Once the installation finishes, click **Finish**.



### 3.1. Verify that Node.js and NPM were successfully installed
{:#verify-nodejs-install}

To verify your install, in Windows, open the application “Command Prompt” or "Terminal". In the window, you
will need to type commands `node -v` and `npm -v`. You can see the commands and their expected outputs in
<a href="#fig3">Figure 3</a>. The versions that you have installed may differ from these versions. The guide
should continue to work, but in case it does not, it may be good to install these specific versions if you can.

<figure id="fig3">
    <img src="diagrams/non-technical-installation-guide/3-check-node-version.png" alt="figure 3" height="147" />
    <figcaption>
        <a href="#fig3">Figure 3.</a> Expected Node.js and NPM library versions.
    </figcaption>
</figure>



## 4. Create your Firebase Project
{:#create-firebase-project}

Firebase is a technology platform made by Google, which provides a platform to host websites. The
Misinformation Game makes use of Firebase for its hosting, authentication, and data storage.
Therefore, to host your instance of the Misinformation Game, your own Firebase instance will
be required. A Google account is required in order to use Firebase. If you do not have a Google
account, you can create one at
[https://accounts.google.com/signup/v2/webcreateaccount](https://accounts.google.com/signup/v2/webcreateaccount).

**Step 1:** Sign in to your Google account in [Firebase Console](https://console.firebase.google.com/).

**Step 2:** Once you have signed in, you should see a similar page as shown in <a href="#fig4">Figure 4</a>.
Click **Create a project**. You will now be prompted for information related to your instance of
the Misinformation Game.

<figure id="fig4">
    <img src="diagrams/non-technical-installation-guide/4-create-firebase-project.png" alt="figure 4" height="179" />
    <figcaption>
        <a href="#fig4">Figure 4.</a> Create a Firebase project.
    </figcaption>
</figure>

**Step 3:** Enter a name for your project. The name of your project will be used to determine the URL that
your study participants will access. Therefore, you may wish to choose an ambiguous name, so that participants
are not influenced by the URL. Once you have selected a name, click **Continue**.

<figure id="fig4a">
    <img src="diagrams/firebase-project-creation.png" alt="figure 4a" height="515" />
    <figcaption>
        <a href="#fig4a">Figure 4a.</a> Select the name of your Firebase project.
    </figcaption>
</figure>

**Step 4:** In the next step you can choose to disable Google Analytics. We recommend that you
disable it, as it doesn't provide any functionality that is used by the Misinformation Game.

<figure id="fig4b">
    <img src="diagrams/disabling-analytics.png" alt="figure 4b" height="348" />
    <figcaption>
        <a href="#fig4b">Figure 4b.</a> Disable analytics in your Firebase project.
    </figcaption>
</figure>

**Step 5:** Click **Create project**. You have now created a Firebase project that can be used to
host the Misinformation Game. However, some additional set-up is still required to get it ready.


### 4.1. Enable Firebase Firestore
{:#enable-firebase-firestore}

The Misinformation Game uses the Firestore Database to store users, studies, and study results. Therefore,
you will need to enable it.

**Step 1:** Select **Firestore Database** under the **Build** tab on the left of the project page.
The option to select is shown in <a href="#fig5">Figure 5</a>.

<figure id="fig5">
    <img src="diagrams/non-technical-installation-guide/5-open-firestore-database.png" alt="figure 5" height="301" />
    <figcaption>
        <a href="#fig5">Figure 5.</a> Open the Firestore database.
    </figcaption>
</figure>

**Step 2:** On the _'Firestore'_ page, click **Create database**. This button is shown in <a href="#fig6">Figure 6</a>.

<figure id="fig6">
    <img src="diagrams/non-technical-installation-guide/6-create-firestore-database.png" alt="figure 6" height="212" />
    <figcaption>
        <a href="#fig6">Figure 6.</a> Open the Firestore database.
    </figcaption>
</figure>

**Step 3:** You will be asked what rules you would like to set for the project’s database. These will be
configured later in the installation process, so select **Start in production mode** and click **Next**.

**Step 4:** You will be asked to select the geographical location for where your database should be hosted.
Select the geographical location that is closest to you and your participants. This selection does not restrict
who can access your instance, but instead just helps to speed up access to the site by hosting it closer to you.
Once you have selected a location, click **Enable**.

**Step 5:** Your database should now be ready to go. You should now see a page similar to Figure 7 below.

<figure id="fig7">
    <img src="diagrams/non-technical-installation-guide/7-blank-firestore-database.png" alt="figure 7" height="375" />
    <figcaption>
        <a href="#fig7">Figure 7.</a> Blank Firestore database.
    </figcaption>
</figure>


### 4.2. Enable Firebase Storage
{:#enable-firebase-storage}

Any images that are embedded within studies will be stored within Firebase Storage. Therefore, Storage
should be enabled.

**Step 1:** Select **Storage** under the **Build** tab on the left of the project page.
The option to select is shown in <a href="#fig8">Figure 8</a>.

<figure id="fig8">
    <img src="diagrams/non-technical-installation-guide/8-blank-storage.png" alt="figure 8" height="218" />
    <figcaption>
        <a href="#fig8">Figure 8.</a> Blank Firebase storage.
    </figcaption>
</figure>

**Step 2:** Your storage should now be set up. If you see a page that looks like Figure 8 above, then
this has been successful. However, if you see the **Get started** page shown in <a href="#fig9">Figure 9</a>,
then you will need to first enable the Firestore Database as explained in an earlier section of this guide.

<figure id="fig9">
    <img src="diagrams/non-technical-installation-guide/9-uninitialised-storage.png" alt="figure 9" height="372" />
    <figcaption>
        <a href="#fig9">Figure 9.</a> Firebase storage before it is enabled.
    </figcaption>
</figure>


### 4.3. Enable Firebase Authentication
{:#enable-firebase-auth}

The Misinformation Game uses Firebase Authentication to authenticate administrators. Administrators
are the users that are given access to upload studies and download their results. This authentication
is not used for participants in your studies.


**Step 1:** Select **Authentication** under the **Build** tab on the left of the project page.
The option to select is shown in <a href="#fig10">Figure 10</a> below.

<figure id="fig10">
    <img src="diagrams/non-technical-installation-guide/10-auth-setup-pt1.png" alt="figure 10" height="232" />
    <figcaption>
        <a href="#fig10">Figure 10.</a> Accessing Firebase authentication to enable it.
    </figcaption>
</figure>

**Step 2:** Click **Get started**.

**Step 3:** You will be asked to select the Sign-In method that you would look to enable. Click on the _'Google'_
icon, as we will be making use of Google accounts for authentication.

**Step 4:** After you click on the Google icon, you will be shown more options. First, click **Enable**,
as shown in Figure 11 below.

**Step 5:** You may now enter your own email under the **Project Support Email** field shown in
Figure 11 below. This contact email is required by Google's authentication service.

**Step 6:** Click the **Save** button, as shown in Figure 11 below.

<figure id="fig11">
    <img src="diagrams/non-technical-installation-guide/11-auth-setup-pt2.png" alt="figure 11" height="423" />
    <figcaption>
        <a href="#fig11">Figure 11.</a> Enabling Firebase Google authentication.
    </figcaption>
</figure>

**Step 7:** The next stage of authentication is to give yourself administrator rights. This step
will be explained later in this guide, as it requires additional set-up to be performed first.


### 4.4. Configure your Firebase Project as a Web-App
{:#enable-firebase-webapp}

Firebase supports mobile apps as well as websites. We must configure the project as a web-app.

**Step 1:** Click **Project Overview** on the left of the project page, as shown in Figure 12 below.

**Step 2:** Click the **Web** icon, which is highlighted in <a href="#fig12">Figure 12</a> below.
The icon should resemble &lt;/&gt;.

<figure id="fig12">
    <img src="diagrams/non-technical-installation-guide/12-webapp-setup-pt1.png" alt="figure 12" height="308" />
    <figcaption>
        <a href="#fig12">Figure 12.</a> Accessing Firebase web-app setup.
    </figcaption>
</figure>

**Step 3:** Register your app by giving the app a name. Any name is okay. The **“Hosting”** settings
can be ignored, as we will configure those separately later in this guide.

**Step 4:** Click **Register App**.

**Step 5:** You will be shown the Firebase SDK (software development kit) settings.
Select **"Use npm"**.

**Step 6:** Copy the larger block of code to a text file on your computer. This configuration
will be required to link the Misinformation Game to your project later. When it is required later,
this code will be referred to as the **"Configuration Information File"**. There is a button in the
bottom-right of this code block that can be pressed to copy it, as shown in Figure 13 below.

<figure id="fig13">
    <img src="diagrams/non-technical-installation-guide/13-webapp-setup-pt2.png" alt="figure 13" height="446" />
    <figcaption>
        <a href="#fig13">Figure 13.</a> Accessing your Firebase web-app config.
    </figcaption>
</figure>

**Step 7:** Once you have saved the configuration information file, click **Continue to console**.



## 5. Deploying the Website
{:#deploying}

The next step of the process is to deploy the Misinformation Game to your Firebase project.
This step will require the software that we installed earlier (Visual Studio Code, Node.js, and NPM).


### 5.1. Opening and Setting Up the Code
{:#opening-codebase}

Step 1: Open the Visual Studio Code app. <br/>
Step 2: Click on File > Open Folder and find the extracted project folder that you saved in section 2.1. <br/>
Step 3: Once the folder is open, you will see a screen similar to <a href="#fig14">Figure 14</a>. On the left
of the screen, you will notice the “Explorer” area. We will be using this section of the screen quite often.

<figure id="fig14">
    <img src="diagrams/non-technical-installation-guide/14-default-visual-studio-screen.png" alt="figure 14" height="454" />
    <figcaption>
        <a href="#fig14">Figure 14.</a> Default Visual Studio View.
    </figcaption>
</figure>

Step 4: In the “Explorer” section, click the “config” toggle and find and click on the “firebase-config.js”
file. You will see something like <a href="#fig14">Figure 14</a>. <br/>
Step 5: Replace the firebaseConfig information with your own information. This information is in the
Configuration Information File, which was saved in section 5.4 of this guide. The area that you need to
replace is circled in <a href="#fig15">Figure 15</a>. <br/>
Step 6: Finally, save the file by pressing _Ctrl + S_ on your keyboard.

<figure id="fig15">
    <img src="diagrams/non-technical-installation-guide/15-edit-firebase-config.png" alt="figure 15" height="543" />
    <figcaption>
        <a href="#fig15">Figure 15.</a> Firebase configuration file in the source code.
    </figcaption>
</figure>


### 5.2. Install Git Bash
{:#install-git-bash}

Windows users will also need to install Git Bash. You can download it from the below link, by clicking
the Windows icon, as seen in <a href="#fig16">Figure 16</a>.
https://git-scm.com/download/win

<figure id="fig16">
    <img src="diagrams/non-technical-installation-guide/16-download-git-installer.png" alt="figure 16" height="300" />
    <figcaption>
        <a href="#fig16">Figure 16.</a> Downloading the git installer.
    </figcaption>
</figure>

After downloading, double-click on the executable. Follow the installation process and do not change any
of the default settings. After this you should have a working Git for Windows instance running on your
computer.


### 5.3. Running the Deployment Script
{:#running-deployment-script}

Now the environment is completely set up and ready for you to edit and to deploy. To deploy a version of
this application on the internet, follow the below steps.

Step 1:  In the top toolbar of Visual Studio Code, click on Terminal > New Terminal. This will open at the
bottom of the application and look like <a href="#fig17">Figure 17</a>.

<figure id="fig17">
    <img src="diagrams/non-technical-installation-guide/17-visual-studio-command-prompt.png" alt="figure 17" height="410" />
    <figcaption>
        <a href="#fig17">Figure 17.</a> Opening the Visual Studio command prompt.
    </figcaption>
</figure>

Step 1.5: If you are on Windows, you will also need to change to the Git Bash terminal. As seen in
<a href="#fig18">Figure 18</a>, first click on the down arrow and then select “Git Bash”.

<figure id="fig18">
    <img src="diagrams/non-technical-installation-guide/18-switch-to-git-bash.png" alt="figure 18" height="199" />
    <figcaption>
        <a href="#fig18">Figure 18.</a> Switching the command prompt to Git Bash.
    </figcaption>
</figure>

This will open a terminal that looks like <a href="#fig19">Figure 19</a>.

<figure id="fig19">
    <img src="diagrams/non-technical-installation-guide/19-blank-git-bash.png" alt="figure 19" height="160" />
    <figcaption>
        <a href="#fig19">Figure 19.</a> Visual Studio command prompt in Git Bash mode.
    </figcaption>
</figure>

Step 2: In the terminal at the bottom of the screen run the following command: `./deploy.sh`

You will now see text beginning to be displayed at the bottom of the terminal screen. This will be installing
all the necessary packages and deploy the app. Please note that this process may take a while. See
<a href="#fig20">Figure 20</a> for an example.

<figure id="fig20">
    <img src="diagrams/non-technical-installation-guide/20-start-deployment.png" alt="figure 20" height="182" />
    <figcaption>
        <a href="#fig20">Figure 20.</a> Beginning the deployment process.
    </figcaption>
</figure>

During this deployment process you will be asked many questions which require a response. These questions
are as follows: <br/>
Question 1: You will then be asked to login to your Google Firebase account. This will open a browser window.
Please login to your Google Firebase account and return to Visual Studio Code. <br/>
Question 2: You will be asked to select a Firebase Project. Select the relevant Firebase project made earlier
and then press Enter to continue. This is seen in <a href="#fig21">Figure 21</a>.

<figure id="fig21">
    <img src="diagrams/non-technical-installation-guide/21-deploy--select-firebase-project.png" alt="figure 21" height="153" />
    <figcaption>
        <a href="#fig21">Figure 21.</a> Selecting the Firebase project in the deployment process.
    </figcaption>
</figure>

Question 3: You will then be asked to give an alias to this project. This can be whatever you would like.
For example, “test”. Press Enter to continue. <br/>
Question 4: You will then be asked to sign in to Google Cloud. Press Y and then Enter. This will open a
login page in your browser, please login with the same Google Account you are using for Firebase. After
this return to Visual Studio Code. <br/>
Question 5: You will then be asked to select the cloud project. Press the number next to your project and
then press Enter to continue. This is seen in <a href="#fig22">Figure 22</a>.

<figure id="fig22">
    <img src="diagrams/non-technical-installation-guide/22-deploy--select-cloud-project.png" alt="figure 22" height="138" />
    <figcaption>
        <a href="#fig22">Figure 22.</a> Selecting the cloud project in the deployment process.
    </figcaption>
</figure>

Question 6: Next you will be asked to make a domain name. <br/>
Before entering the URL, please note that the domain name must be your Firebase Project ID. You can get
the Project ID from Firebase by clicking on the “Gear” icon on the left and then on “Project Settings”.
<a href="#fig23">Figure 23</a> and <a href="#fig24">Figure 24</a> below demonstrates this.

<figure id="fig23">
    <img src="diagrams/non-technical-installation-guide/23-deploy--access-project-settings.png" alt="figure 23" height="267" />
    <figcaption>
        <a href="#fig23">Figure 23.</a> Accessing the Firebase project settings.
    </figcaption>
</figure>

<figure id="fig24">
    <img src="diagrams/non-technical-installation-guide/24-deploy--copy-project-id.png" alt="figure 24" height="241" />
    <figcaption>
        <a href="#fig24">Figure 24.</a> The Project ID on the project settings page.
    </figcaption>
</figure>

The URL must be in the format of “<projectID>. appspot.com.” For example, “test-15cff.appspot.com” is
a valid domain. See <a href="#fig25">Figure 25</a> for an example. After entering the URL, press Enter to continue.

<figure id="fig25">
    <img src="diagrams/non-technical-installation-guide/25-deploy--enter-project-id.png" alt="figure 25" height="122" />
    <figcaption>
        <a href="#fig25">Figure 25.</a> Entering a Firebase project's domain name.
    </figcaption>
</figure>

Step 4: The site is now fully deployed and ready to be accessed. You will see something similar to
<a href="#fig26">Figure 26</a>.

<figure id="fig26">
    <img src="diagrams/non-technical-installation-guide/26-deploy--success.png" alt="figure 26" height="129" />
    <figcaption>
        <a href="#fig26">Figure 26.</a> Command prompt after a successful deployment.
    </figcaption>
</figure>

You can access the website on your browser at the domain \[Your Project ID\].web.app.
\[Your Project ID\]” is the project ID obtained for question 6 above.



## 6. Conclusion
{:#conclusion}

You should now have a fully deployed instance of the Misinformation Game! You may now sign in to your
instance of The Misinformation Game, and register yourself as an administrator, through the process
described in the [Registering Administrators documentation](/Administrators).

Once you have registered yourself as an admin, then you can read more about uploading and managing your
studies in the [Managing Studies documentation](ManagingStudies). Additionally, information on configuring
your studies can be found in the [Study Configuration documentation](/StudyConfiguration). I hope The
Misinformation Game proves useful for your research!
