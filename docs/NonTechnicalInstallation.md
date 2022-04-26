# Misinformation Game Installation Guide 
## 1. Introduction 
This document will outline the step-by-step process of installing and hosting the Misinformation Game website. This document will also go through the installation process for all the pre-requisite software that is needed to properly install and edit the app. 

Following this tutorial and installing all of the applications and software will enable you to freely edit the code of this project. 

## 2. Download The Code Base and Install Visual Studio Code 
The first step is to download the code base, as well as an integrated development environment (IDE) to allow easy editing of the files in the code base. We recommend using Visual Studio Code, but any IDE can be used for this process.

### 2.1 Download the Code Base From Github
To download and save the code base onto your device, you can access it at the following link: </br>
https://github.com/TheMisinformationGame/MisinformationGame

On this page you will need to click on the green _“Code”_ button and then on the _“Download Zip”_ button as seen in Figure 1 below. This will then prompt you to download a zip file of the code, which you can save anywhere on your computer. Extract the files into a folder. The code is now ready to be accessed.

**INSERT FIG 1 HERE**

### 2.2 Download and Install Visual Studio Code 
This installation guide demonstrates the installation process of downloading the Visual Studio Code on Windows. Should you be using a Mac, the installation process should be similar, but in case you encounter any difficulties, you can follow the Visual Studio Code installation guide for Mac at this link:  https://code.visualstudio.com/docs/setup/mac.

Download Visual Studio Code from the following link: 
https://code.visualstudio.com/download

Once the download is complete, double click on the file to begin the installation process. 

Step 1: Read through the license agreement, accept the license agreement and then press “Next”. </br>
Step 2: On the ‘Select Destination Location’ screen, click on “Next.”</br>
Step 3: On the ‘Select Start Menu Folder’ screen, click on “Next.”</br>
Step 4: On the ‘Additional Tasks’ screen, click on “Add to PATH (requires shell restart)” then click “Next”.</br>
Step 5: On the ‘Ready to Install’ Screen, click on “install”.</br>

After the install bar is complete you should now be able to use Visual Studio Code. 

## 3. Install NodeJS 
The next step in the process is to download NodeJS and npm. These are needed to enable the application to download packages necessary for deployment. 
https://nodejs.org/en/download/

Click the “Windows Installer” icon to download the installation file. This is seen in Figure 2 below. 

**INSERT FIG 2 HERE**

Step 1: Once the installer finishes downloading, run the file.  </br> 
Step 2: You will then be asked if you want to run the software. Click “Run”.   </br>
Step 3: On the next page, click “Next.” </br>
Step 4: Read the license agreement and click “Next” if you agree. </br>
Step 5: On the installation location page, click “Next.” </br>
Step 6: The next page will ask you if you want certain components. Leave the default selections and click “Next.” </br>
Step 7: Click on “Install” and when it finishes, click on the “Finish” button.  </br>

### 3.1 Verify NodeJS and NPM 
To verify your install, in Windows, open the application “Command Prompt” or "Terminal". In the window, you will need to type commands `node -v` and `npm -v`. You can see the commands and outputs below in Figure 3. 

**INSERT FIG 3 HERE**

## 4. Firebase Set Up 
Firebase is a technology platform made by Google, which makes running and hosting a website simple. In this project we are utilising Firebase to store information, authenticate users and to host the website. 

A Google account is required in order to use Firebase. If you do not have a Google account, you can create one here: 
https://accounts.google.com/signup/v2/webcreateaccount?hl=en&flowName=GlifWebSignIn&flowEntry=SignUp

You can then login to your account at:
https://console.firebase.google.com/

Once you have logged in click on “Create a project” as seen in Figure 4.

**INSERT FIG 4 HERE**

After clicking on “Create a Project” you will be asked to enter some set up information. Follow the instructions below:

Step 1: Enter the name for your project and accept the terms if you agree to them. Click “Continue”.</br>
Step 2: In the next step you can choose to accept or decline Google Analytics. We recommend that you disable it, as it doesn’t provide any functionality for the application. The service provides analytics about your application, like its usage and advertising metrics. If you want to find out more about Google Analytics, click the following link: https://www.youtube.com/watch?v=8iZpH7O6zXo&ab_channel=Firebase 

Now you have started a Firebase Project. Don’t close the browser just yet though, we still require this page for the next steps in set up. 

### 4.1 Setup Firestore
Next, turn on ‘FireStore’, which is the database for the application. To do this, follow the below steps:

Step 1: Click on “Build” and then “Firestore Database” on the left-hand side of the screen. This is shown in Figure 5.

**INSERT FIG 5 HERE**

Step 2: Once the FireStore page has loaded, click on “Create database”, as seen in Figure 6.

**INSERT FIG 6 HERE**

Step 3: Next, you will be asked what rules you would like to set for the project’s database. For the time being, click “Start in production mode”. Click “Next” to continue.</br>
Step 4: You will be asked at what geographical location you would like your database to be stored. Pick the location that best suits you from the dropdown box. This is most likely the location closest to you. Click “Enable” to continue.</br>
Step 5: Your database should now be ready to go. Your screen will be similar to Figure 7 below. 

**INSERT FIG 7 HERE**

### 4.2 Set Up Storage 
For our application we want quick and responsive loading of images. These images can range from post images to avatar images. To have images load rapidly, we need to store them in Firebase’s Storage feature. To enable Storage, click on _“Build,”_ then click on _“Storage”_. 

If you see a screen like Figure 8, this means that storage is all set up and ready to go. Please note, that you must set up FireStore first. If you see the “Get Started” button in Figure 9, please follow the steps in section 5.1 of this guide.

**INSERT FIG 8 HERE**

**INSERT FIG 9 HERE**

### 4.3 Set Up Authentication  
The next step in setting up our Firebase project is to set up administrator authentication.

Step 1: Click on “Build”, then “Authentication” and finally “Get Started”. This can be seen in Figure 9.

**INSERT FIG 10 HERE**

Step 2: You will now be asked which Sign-In method you would like to set up. Click on the “Google” icon—we will be making use of Google accounts for authentication. You can select another method, but this guide will assume that Google is used. </br>
Step 3: After you click on the Google icon, you will see more options. Firstly, click on “Enable” and then on “Project Support Email” and select your own email. Finally click on “Save” to continue. This can be seen in Figure 11.

**INSERT FIG 11 HERE**

Step 4:  The next stage of authentication is to give yourself Administrator rights. We will first need to set up the website fully, so this step will be done in Section 7 of this guide.

### 4.4 Add a Web App to the Project
The next step in Firebase is to add a Web App to the project. 

Step 1: Click on “Project Overview” and then click the “Web App” Icon. This is seen in Figure 12.

**INSERT FIG 12 HERE**

Step 2: Register your app by giving the app a name. Any name is ok. For the time being ignore the “Hosting” settings, we will be adding that later. Then click “Register App”. </br>
Step 3: Next you will see the software development kit (SDK) settings. Click on “Use npm”. Then copy and paste the larger block of code, as seen in Figure 13.
Save this code block into a text file and save it on your computer, we will need this information later. We will be referring to this file as the “Configuration Information File” for the remaining of the guide.  

**INSERT FIG 13 HERE**

After you click “Continue to console”, your Firebase project will now be set up for use with a Website. 

The initial set up of FireBase is complete, although we will need to return to FireBase later in this Installation guide. 

## 5. Deploying the Website
The next part of the set-up process is to have the game website running on your own computer. For this step we will need to use Visual Studio Code, NodeJS, npm, and the Firebase Project that we have set up. 

### 5.1	OPENING AND SETTING UP THE CODE
Step 1: Open the Visual Studio Code app. </br>
Step 2: Click on File > Open Folder and find the extracted project folder that you saved in section 2.1. </br>
Step 3: Once the folder is open, you will see a screen similar to Figure 14. On the left of the screen, you will notice the “Explorer” area. We will be using this section of the screen quite often. 

**INSERT FIG 14 HERE**

Step 4: In the “Explorer” section, click the “config” toggle and find and click on the “firebase-config.js” file. You will see something like Figure 14. </br>
Step 5: Replace the firebaseConfig information with your own information. This information is in the Configuration Information File, which was saved in section 5.4 of this guide. The area that you need to replace is circled in Figure 15.</br>
Step 6: Finally, save the file by pressing _Ctrl + S_ on your keyboard. 

**INSERT FIG 15 HERE**

### 5.2 Install Git Bash (For Windows) 
Windows users will also need to install Git Bash. You can download it from the below link, by clicking the Windows icon, as seen in Figure 16. 
https://git-scm.com/download/win 

**INSERT FIG 16 HERE**

After downloading, double click on the executable. Follow the installation process and do not change any of the default settings. After this you should have a working Git for Windows instance running on your computer. 

### 5.3	RUNNING THE APP
Now the environment is completely set up and ready for you to edit and to deploy. To deploy a version of this application on the internet, follow the below steps. 

Step 1:  In the top toolbar of Visual Studio Code, click on Terminal > New Terminal. This will open at the bottom of the application and look like Figure 16. 

**INSERT FIG 17 HERE**

Step 1.5: If you are on Windows, you will also need to change to the Git Bash terminal. As seen in Figure 18, first click on the down arrow and then select “Git Bash”. 

**INSERT FIG 18 HERE**

This will open a terminal that looks like Figure 19.

**INSERT FIG 19 HERE**

Step 2: In the terminal at the bottom of the screen run the following command: `./deploy.sh`

You will now see text beginning to be displayed at the bottom of the terminal screen. This will be installing all of the necessary packages and deploy the app. Please note that this process may take a while. See Figure 20 for an example. 

**INSERT FIG 20**

During this deployment process you will be asked many questions which require a response. These questions are as follows: </br>
Question 1: You will then be asked to login to your Google Firebase account. This will open a browser window. Please login to your Google Firebase account and return to Visual Studio Code. </br> 
Question 2: You will be asked to select a Firebase Project. Select the relevant Firebase project made earlier and then press Enter to continue. This is seen in Figure 21.

**INSERT FIG 21 **

Question 3: You will then be asked to give an alias to this project. This can be whatever you would like. For example, “test”. Press Enter to continue. </br>
Question 4: You will then be asked to sign in to Google Cloud. Press Y and then Enter. This will open a login page in your browser, please login with the same Google Account you are using for Firebase. After this return to Visual Studio Code. </br>
Question 5: You will then be asked to select the cloud project. Press the number next to your project and then press Enter to continue. This is seen in Figure 22.

**FIG 22**

Question 6: Next you will be asked to make a domain name. </br>
Before entering the URL, please note that the domain name must be your Firebase Project ID. You can get the Project ID from Firebase by clicking on the “Gear” icon on the left and then on “Project Settings”. Figure 23 and 24 below demonstrates this. 

**FIG 23**

**FIG 24**

The URL must be in the format of “<projectID>. appspot.com.” For example, “test-15cff.appspot.com” is a valid domain. See Figure 25 for an example. After entering the URL, press Enter to continue. 

**FIG 25**

Step 4: The site is now fully deployed and ready to be accessed. You will see something similar to Figure 26.
  
**FIG 26**

You can access the website on your browser at the below domain: 
<your project ID>.web.app
Where “<your project ID>” is your project ID which you got in question 6 above.

## 6. Giving Yourself Admin Rights
  
In order to give yourself Administrator permissions you will need to follow the below steps:
Step 1: Access your deployed website at <your project ID>.web.app. This will take you to the page in Figure 27.
</br>
**FIG 27**

Step 2: Then click on “Access the Admin Dashboard” and this will take you to the Admin Sign In page as seen in Figure 28. On the sign in page, click on “Sign in with Google” and sign in with your Google account. 

**FIG 28**

Step 3: After signing in you will see that you do not have permissions yet. This is seen in Figure 29.

**FIG 29**

Step 4: You will now need to get to your Google Firebase project at:
https://console.firebase.google.com/
In your Firebase project, click on “Build” and then click on “Authentication” as seen in Figure 30.

**FIG 30**
  
Step 5: In the Authentication screen, make sure you are in the Users tab. 
Find yourself, in the identifier column and then copy your User UID. This can be seen in Figure 31.

**FIG 31**

Step 6: Now that we have the User UID, we now need to add this to the database. 
Click on “Build” and then click on “Firestore Database”. 
Make sure you are on the “Data” tab and then click on “Start Collection”.
This is all seen in Figure 32.

**FIG 32**

Step 7: You will then be asked to name the collection. The collection must be called “Admins”. Then click “Next” to continue. This is seen in Figure 33. 

**FIG 33**
  
Step 8: You will then be asked to create a document in the collection. 
For the Document ID, paste in your “User UID” that you copied earlier in step 5.
Next in Field type “Name” and then in value insert the user’s name. Then click “Save.”
This is seen in Figure 34.

**FIG 34**
  
Step 9: You will now have added your user as an Admin. You can test this by returning to the admin page on your website. You will see a page like Figure 34. 
  
_NOTE: Other administrators will be able to set up their own administrator account on the same website domain. The entire installation and hosting process only needs to be followed by one administrator._

**FIG 35**
  
## 7. Conclusion
You have now fully deployed the website. The website is now ready for use and your studies can be uploaded into the Firebase database. 
  



