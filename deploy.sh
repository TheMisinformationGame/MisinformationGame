#!/bin/bash


usage() {
  echo "Usage: $0 [--create-gcloud-installation] [--skip-cors]" 1>&2;
  exit 1;
}

# =========================
#    Read CLI Arguments.
# =========================
do_install_gcloud=false
do_skip_cors=false
in_docker=false

for var in "$@"
do
  if [[ "$var" == "--create-gcloud-installation" ]]; then
    do_install_gcloud=true
  elif [[ "$var" == "--skip-cors" ]]; then
    do_skip_cors=true
  elif [[ "$var" == "--docker" ]]; then
      in_docker=true
  else
    usage
    exit 1
  fi
done


echo "=========================="
echo "Installing dependencies..."
echo "=========================="
npm ci || { echo "Installing dependencies failed!" ; exit 1; }

echo " "
echo "=================================="
echo "Installing the Google Cloud SDK..."
echo "=================================="

gcloud_command="gcloud"
gsutil_command="gsutil"
gcloud_installed=true

# If we want to create our own installation of GCloud, then
# we just ignore whether it has already been installed.
if [ "$do_install_gcloud" = true ]; then
  gcloud_installed=false
fi
if ! command -v "$gcloud_command" &> /dev/null; then
  gcloud_installed=false
fi
if ! command -v "$gsutil_command" &> /dev/null; then
  gcloud_installed=false
fi

if [ "$gcloud_installed" = true ]; then
  echo " "
  echo "Detected an existing external GCloud installation to use instead of installing."
  echo "If this is not desired, then you may pass the \"--create-gcloud-installation\""
  echo "option to this script."
else
  # Detect a previous installation of GCloud.
  gcloud_command=".GoogleCloud/google-cloud-sdk/bin/gcloud"
  gsutil_command=".GoogleCloud/google-cloud-sdk/bin/gsutil"
  gcloud_installed=true

  # If we want to clean the installation of GCloud, then
  # we just ignore whether it has already been installed.
  if ! command -v "$gcloud_command" &> /dev/null; then
    gcloud_installed=false
  fi
  if ! command -v "$gsutil_command" &> /dev/null; then
    gcloud_installed=false
  fi

  if [ "$gcloud_installed" = true ]; then
    echo " "
    echo "Detected a previous GCloud installation to use instead of installing."
    echo "If this is not desired, then you may delete the \".GoogleCloud\""
    echo "directory to re-install GCloud."
  else
    rm -rf .GoogleCloud || { echo "Unable to remove old .GoogleCloud installation!" ; exit 1; }
    mkdir .GoogleCloud || { echo "Unable to create .GoogleCloud directory to install Google Cloud into!" ; exit 1; }
    curl https://sdk.cloud.google.com > .GoogleCloud/install.sh || { echo "Unable to download Google Cloud install script!" ; exit 1; }
    bash .GoogleCloud/install.sh --disable-prompts --install-dir=.GoogleCloud || { echo "Unable to install Google Cloud!" ; exit 1; }
  fi
fi


echo " "
echo "========================================================="
echo "Connecting to Firebase, you may be prompted to sign in..."
echo "========================================================="
if [ "$in_docker" = true ]; then
  npx firebase-tools login --no-localhost || { echo "Signing you into Firebase failed!" ; exit 1; }
else
  npx firebase-tools login || { echo "Signing you into Firebase failed!" ; exit 1; }
fi

echo " "
echo "================================================================="
echo "Please select the Firebase project you would like to deploy to..."
echo "================================================================="
echo " "
echo "When prompted for an alias, enter 'main'."
echo " "
npx firebase-tools use --add || { echo "Connecting to your Firebase project failed!" ; exit 1; }

echo " "
echo "==========================="
echo "Building the application..."
echo "==========================="
npm run build || { echo "Building the application failed!" ; exit 1; }

echo " "
echo "========================================"
echo "Deploying the application to Firebase..."
echo "========================================"
npx firebase-tools deploy || { echo "Deploying to Firebase failed!" ; exit 1; }

if [ ! "$do_skip_cors" = true ]; then
  echo " "
  echo "==================================="
  echo "Authenticating with Google Cloud..."
  echo "==================================="
  "$gcloud_command" auth login || { echo "Authenticating Google Cloud failed!" ; exit 1; }

  echo " "
  echo "============================"
  echo "Initialising Google Cloud..."
  echo "============================"
  "$gcloud_command" init --skip-diagnostics || { echo "Initialising Google Cloud failed!" ; exit 1; }

  echo " "
  echo "==============================================="
  echo "Setting up the CORS settings for the website..."
  echo "==============================================="
  echo " "

  # Automatically extract storageBucket from the config file
  URL=$(grep 'storageBucket' config/firebase-config.js | sed -E 's/.*"([^"]+)".*/\1/')
  if [ -z "$URL" ]; then
    echo "Error: storageBucket value not found in config/firebase-config.js" && exit 1
  fi

  echo "Uploading CORS settings to $URL..."
  "$gsutil_command" cors set src/config/cors.json "gs://$URL" || { echo "Uploading CORS settings failed!" ; exit 1; }
fi

echo " "
echo "======================"
echo "Successfully Deployed!"
echo "======================"
echo " "
echo "You should now be able to access your game at your project .web.app domain! (e.g. misinformation-game.web.app)"
echo " "
