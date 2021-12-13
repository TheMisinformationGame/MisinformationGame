# Misinformation Game Documentation

The Misinformation Game is a social media simulator built to
study the behavior of people when they interact with social
media. To achieve this, The Misinformation Game simulates
a social media feed for research participants. Participants
will be shown one fake social media post at a time. They may
then react to the post and its comments. The posts, the sources
of those posts, and the comments underneath the posts that are
shown to participants are all configurable though the
[configuration spreadsheet](StudyConfiguration.md).

Additionally, participants may have a follower count and
credibility rating that will be tracked throughout their
game. These values will change throughout the game as the
interactions of participants with posts affect their follower
count and credibility rating. The changes to a participant's
follower count and credibility rating after they interact
with posts can be controlled through the configuration
spreadsheet.


### Example Game
If you would like to test playing through a study created using
The Misinformation Game, you can access an example game at
[https://misinformation-game.web.app/study/axsvxt37ctac6ltr](https://misinformation-game.web.app/study/axsvxt37ctac6ltr).
You can enter any ID to access the example game.

![Game Screenshot](screenshots/example-game.png)

<p class="spacer"></p>

## Getting Started
The Misinformation Game is primarily a research tool.
Therefore, it contains many configuration options to
tailor the game for specific research purposes. To find
out whether The Misinformation Game is the right fit for
your research, you may see the options for configuring
your own study in the
[study configuration documentation](StudyConfiguration.md).
Additionally, the results that are made available
for analysis are also described in the
[results documentation](Results.md).

Once you have decided to create and run a study using
The Misinformation Game, you will need to host your
own website for the game. The steps to host your own
instance of the game are described in both a
[Non-Technical Installation Guide](NonTechnicalInstallation.pdf)
and a [Technical Installation Guide](TechnicalInstallation.md).
If you are proficient with the command-line and
installing technical tools, then the technical
installation guide will be quicker, and requires fewer
steps. However, if you are not familiar with these
technologies, then the non-technical installation
guide should be easier to follow.

## Usage Documentation
- [How to play The Misinformation Game](HowToPlay.md) -
  The guide given to participants before they start a study.
- [Study Configuration](StudyConfiguration.md) - A guide to create your own study.
- [Results](Results.md) - Descriptions of the results that are recorded by the game.
- [Managing Studies](ManagingStudies.md) - How to upload, enable, disable, and delete your studies.
- [Registering Administrators](Administrators.md) - How to securely assign administrator privileges.

## Hosting Documentation
- [Firebase Pricing](FirebasePricing.md) - A guide to estimate the hosting costs of running a study.
- [Non-Technical Installation Guide](NonTechnicalInstallation.pdf) -
  A guide to host your own study using Firebase (longer, for non-technical users).
- [Technical Installation Guide](TechnicalInstallation.md) -
  A guide to host your own study using Firebase (shorter, for technical users).
- [Updating your Installation](Updating.md) -
  A guide to retrieve new features and fixes for your installation.

## System Documentation
- [Technical Overview](TechnicalOverview.md) - A broad overview of the tech-stack used by the game.
- [Simulation](Simulation.md) - An in-depth description on the simulation that powers the game.
- [Development Environment](Development.md) - A guide for developers to make adjustments to the game.
- [Original Design](original-design/README.md) - The original, outdated, design document for the game.

## Other Useful Links
- [Source Code](https://github.com/TheMisinformationGame/MisinformationGame) -
  The Misinformation Game is proudly open-source! 
- [Issue Tracker](https://github.com/TheMisinformationGame/MisinformationGame/issues) -
  If you find any issues, please report them here. 
- [Example Game](https://misinformation-game.web.app/study/axsvxt37ctac6ltr) -
  Dip your toes in with an example game.
