#!/bin/bash

{ # Braces protect against edits to this file whilst it is executing.


# Make sure that git is installed.
if ! command -v git &> /dev/null; then
    echo "The git command could not be found."
    echo " "
    echo "Please install git to retrieve new updates of The Misinformation Game."
    echo "Installers for git can be found at https://git-scm.com/downloads."
    echo " "
    exit
fi

# This update is destructive. Make sure the user knows that.
echo "======================================================"
echo "Do you wish to lose all your local changes other"
echo "than your config so that you can retrieve new updates?"
echo "======================================================"
echo " "
echo "If you have made changes to the source code other than"
echo "to edit config files, then this command should not be used."
echo " "
echo "Enter YES to confirm, or NO to cancel:"
printf "> "
read -r CONFIRMATION || exit 1
echo " "

if [ "$CONFIRMATION" != "YES" ]; then
  echo "Cancelled update."
  exit 1
fi

# If the current directory isn't a git repository, make it one.
if [ "$(pwd)" != "$(git rev-parse --show-toplevel)" ]; then
  echo "Converting your source code into a git repository..."

  # Initialise this directory as a git repository.
  git init || { echo "Unable to initialise this directory as a git repository!" ; exit 1; }
  git checkout -b main || { echo "Unable to create main branch!" ; exit 1; }
  git add --all || { echo "Unable to add initial contents of repository!" ; exit 1; }
  git commit -m "Backup repository before setting up git" || { echo "Unable to backup repository!" ; exit 1; }
  git remote add origin git@github.com:TheMisinformationGame/MisinformationGame.git || { echo "Unable to link this repository to The Misinformation Game's repository on GitHub!" ; exit 1; }

  # Backup the current state of the repository.
  git checkout -b git-setup-backup || { echo "Unable to backup repository!" ; exit 1; }
fi

# Create a temporary directory to save config files into.
if ! tmp="$(mktemp -d)"; then
  echo "Unable to create temporary directory for maintaining config files."
  exit 1
fi

# Copy the files we want to save away.
cp -f ./config/firebase-config.js "$tmp/firebase-config.js" || { echo "Unable to save your Firebase config from ./config/firebase-config.js!" ; exit 1; }

# Make sure we are in the main branch.
git checkout main || { echo "Unable to checkout the main branch!" ; exit 1; }

# Fetch the latest version of the repository.
git fetch origin main || { echo "Unable to fetch new updates!" ; exit 1; }

# Reset to the latest version of the repository.
git reset --hard origin/main || { echo "Unable to apply updates to the git repository!" ; exit 1; }

# Copy back in the Firebase config.
cp -f "$tmp/firebase-config.js" ./config/firebase-config.js || { echo "Unable to restore your Firebase config to ./config/firebase-config.js!" ; exit 1; }

# Success!
echo " "
echo "=============================="
echo "Update completed successfully!"
echo "=============================="
echo " "
echo "Run ./deploy.sh again to update your instance of The Misinformation Game."
echo " "


# This exit and the braces protect against edits to this file while it is running.
exit $?
}
