# Updating your instance of The Misinformation Game

This guide will show you how to update your instance of
The Misinformation Game to the latest version from this
GitHub repository.

## 1. Run the automatic update script
Updates can be automatically downloaded by running
the automatic `update.sh` script from the root
directory of the source code.

This command will ask you to confirm its usage,
as the command is destructive. Any changes you
have made to the source code other than to the
config files will be lost. Therefore, if you
have made edits to the project other than to
just change the config files, you should not
use the automatic update script. Instead, you
should use git manually to download the new
updates and merge them with your changes.

If you have not made any edits to the source
code other than to change the config files,
then the update script is perfectly safe to
use.

Once you have confirmed, the script should run
quickly to download the new updates and apply
them to your source code.

## 2. Deploy the new updates
Once you have downloaded the updates, you can run
the `deploy.sh` script again to deploy the new
updates to your instance of The Misinformation Game.
The `deploy.sh` command should also be run from the
root directory of the source code.

A guide on the usage of the `deploy.sh` script can
be found within the
[Installation.md](https://github.com/TheMisinformationGame/MisinformationGame/blob/main/docs/Installation.md#24-deploy-your-firebase-project)
document.
