---
title: Updating
showPath: true
showBackToTop: false
---

# Updating your Instance of The Misinformation Game
{:#intro .no_toc}

This guide will show you how to update your instance of The Misinformation Game to
the latest version from the
[MisinformationGame GitHub repository](https://github.com/TheMisinformationGame/MisinformationGame).
You will be required to update the source code that you downloaded when you installed
your instance of The Misinformation Game, and then deploy these new changes to your
Firebase instance. One process to achieve this is described below.



## Table of Contents
{:#toc .no_toc}
* toc
{:toc}



## 1. Open a terminal
{:#open-a-terminal}

The update and deployment scripts require a [Bash-compliant](https://www.gnu.org/software/bash/)
terminal to run. This section will describe how to open a terminal that you can use to update
your instance of The Misinformation Game.

**Step 1:** Open a terminal program where you can run the script. This script is written in
[Bash](https://www.gnu.org/software/bash/), and as such it will not run in the Windows command
prompt. However, it will run in the Mac Terminal. If you are on Windows or are more comfortable
using Visual Studio Code, then you may use the Git Bash terminal from within
[Visual Studio Code](https://code.visualstudio.com/). The installation and use of Visual Studio
Code for this purpose is described in the
[Non-Technical Installation Guide documentation](/NonTechnicalInstallation#install-git-bash).

**Step 2:** You _must_ set the current working directory to the source code directory of
The Misinformation Game that you will have downloaded when following either of the installation
guides. This can be done by executing the command `cd <dir>` with `<dir>` replaced by the
path to the source code directory on your computer. For example, `cd ~/Documents/MisinformationGame`.

**Step 3:** You should now have a command prompt ready where you can run the update and deployment
scripts from. To verify that your terminal is set up correctly, you may run the `ls` command. This
should list all the files within the source code repository for The Misinformation Game on your
computer. You can verify that the files match by accessing the source code directory through a
file manager program (e.g., [Finder](https://en.wikipedia.org/wiki/Finder_(software)) on Mac, or
[File Explorer](https://en.wikipedia.org/wiki/File_Explorer) on Windows).



## 2. Run the automatic update script
{:#run-automatic-script}

The automatic update script, `update.sh`, will update your local source code repository
to match the latest source code in the
[MisinformationGame GitHub repository](https://github.com/TheMisinformationGame/MisinformationGame).
However, you will still need to deploy the new source code to your
Firebase instance as described in the [Deploy the new updates section](#deploy-updates).

**Step 1:** You must open a terminal program and change its working directory to The Misinformation
Game source code, as described in the [Open a terminal section](#open-a-terminal).

**Step 2:** You may now run the automatic update script by typing `./update.sh` within the terminal.

**Step 3:** If the command tells you that you must install git, then you may download its
[CLI](https://en.wikipedia.org/wiki/Command-line_interface) from the
[git download page](https://git-scm.com/downloads). Git is used for version control, and
it is used to download the new source code from
[GitHub](https://github.com/TheMisinformationGame/MisinformationGame). It is very widely used
for software development.

**Step 4:** The command will ask you to confirm its usage, as the command is destructive.
Any changes you have made to the source code other than to the config files will be lost.
Therefore, if you have made edits to the project other than to just change the config
files, you should not use the automatic update script. Instead, you should use git to
manually pull the new updates from the
[Misinformation Game repository](https://github.com/TheMisinformationGame/MisinformationGame),
and merge them with your changes.

**Step 5:** If you have not made any edits to the source code other than to
change the config files, then the update script is safe to use. Enter `YES`
into the terminal, and press enter to start the update.

**Step 6:** The script should download and apply the new updates, and then print
`Update completed successfully!` to the terminal. If an error occurs, then you may
have to install git or change some file permissions. If you are not able to resolve
the issue yourself, then you may create an issue in our
[Issue Tracker](https://github.com/TheMisinformationGame/MisinformationGame/issues),
and we will try to help you resolve the issue.


## 3. Run the deployment script
{:#deploy-updates}

Once you have retrieved the new updates, you can run the deployment script,
`deploy.sh`, to deploy this source code to your Firebase instance.

**Step 1:** You must open a terminal program and change its working directory to The Misinformation
Game source code, as described in the [Open a terminal section](#open-a-terminal).

**Step 2:** You may now run the deployment script by typing `./deploy.sh` within the terminal.

**Step 3:** The deployment script may ask you a series of questions about the Firebase instance
that you wish to update. A guide to answer these questions is provided in the
[Technical Installation Guide](/TechnicalInstallation#deploy).

**Step 4:** Once you have completed your deployment, you should now be able to
reload your instance of The Misinformation Game and see the new updates.
