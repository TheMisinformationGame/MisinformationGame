#!/bin/bash

echo "=========================="
echo "Installing dependencies..."
echo "=========================="
npm ci || { echo "Installing dependencies failed!" ; exit 1; }

echo " "
echo "=================================="
echo "Installing the Google Cloud SDK..."
echo "=================================="
rm -rf .GoogleCloud || { echo "Unable to remove old .GoogleCloud installation!" ; exit 1; }
mkdir .GoogleCloud || { echo "Unable to create .GoogleCloud directory to install Google Cloud into!" ; exit 1; }
curl https://sdk.cloud.google.com > .GoogleCloud/install.sh || { echo "Unable to download Google Cloud install script!" ; exit 1; }
bash .GoogleCloud/install.sh --disable-prompts --install-dir=.GoogleCloud || { echo "Unable to install Google Cloud!" ; exit 1; }

echo " "
echo "========================================================="
echo "Connecting to Firebase, you may be prompted to sign in..."
echo "========================================================="
npx firebase login || { echo "Signing you into Firebase failed!" ; exit 1; }

echo " "
echo "================================================================="
echo "Please select the Firebase project you would like to deploy to..."
echo "================================================================="
echo " "
echo "When prompted for an alias, enter 'main'."
echo " "
npx firebase use --add || { echo "Connecting to your Firebase project failed!" ; exit 1; }

echo " "
echo "==========================="
echo "Building the application..."
echo "==========================="
npm run build || { echo "Building the application failed!" ; exit 1; }

echo " "
echo "========================================"
echo "Deploying the application to Firebase..."
echo "========================================"
npx firebase deploy || { echo "Deploying to Firebase failed!" ; exit 1; }

echo " "
echo "============================"
echo "Initialising Google Cloud..."
echo "============================"
.GoogleCloud/google-cloud-sdk/bin/gcloud init --skip-diagnostics || { echo "Initialising Google Cloud failed!" ; exit 1; }

echo " "
echo "==============================================="
echo "Setting up the CORS settings for the website..."
echo "==============================================="
echo " "
echo "Please enter the URL of your project as a .appspot.com domain (e.g. misinformation-game.appspot.com):"
read -r URL || exit 1
.GoogleCloud/google-cloud-sdk/bin/gsutil cors set src/config/cors.json "gs://$URL" || { echo "Uploading CORS settings failed!" ; exit 1; }

echo " "
echo "======================"
echo "Successfully Deployed!"
echo "======================"
echo " "
echo "You should now be able to access your game at your project .web.app domain! (e.g. misinformation-game.web.app)"
echo " "
