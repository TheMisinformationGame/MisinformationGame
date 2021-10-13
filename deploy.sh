#!/bin/bash

echo "=========================="
echo "Installing dependencies..."
echo "=========================="
npm install || exit

echo " "
echo "============================================================="
echo "Installing Firebase, you may be prompted for your password..."
echo "============================================================="
sudo npm install -g firebase-tools || exit

echo " "
echo "=================================="
echo "Installing the Google Cloud SDK..."
echo "=================================="
mkdir .GoogleCloud
curl https://sdk.cloud.google.com > .GoogleCloud/install.sh
bash .GoogleCloud/install.sh --disable-prompts --install-dir=.GoogleCloud

echo " "
echo "========================================================="
echo "Connecting to Firebase, you may be prompted to sign in..."
echo "========================================================="
firebase login || exit

echo " "
echo "================================================================="
echo "Please select the Firebase project you would like to deploy to..."
echo "================================================================="
echo " "
echo "When prompted for an alias, enter 'main'."
echo " "
firebase use --add || exit

echo " "
echo "==========================="
echo "Building the application..."
echo "==========================="
npm run build || exit

echo " "
echo "========================================"
echo "Deploying the application to Firebase..."
echo "========================================"
firebase deploy || exit

echo " "
echo "============================"
echo "Initialising Google Cloud..."
echo "============================"
.GoogleCloud/google-cloud-sdk/bin/gcloud init --skip-diagnostics || exit

echo " "
echo "==============================================="
echo "Setting up the CORS settings for the website..."
echo "==============================================="
echo " "
echo "Please enter the URL of your project as a .appspot.com domain (e.g. misinformation-game.appspot.com):"
read -r URL || exit
.GoogleCloud/google-cloud-sdk/bin/gsutil cors set src/config/cors.json "gs://$URL" || exit

echo " "
echo "======================"
echo "Successfully Deployed!"
echo "======================"
echo " "
echo "You should now be able to access your game at your project .web.app domain! (e.g. misinformation-game.web.app)"
echo " "
