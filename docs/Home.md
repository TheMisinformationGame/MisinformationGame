---
title: 'The Misinformation Game: A social media simulator for research'
skipTitleSuffix: true
showPath: false
permalink: /
---

<p class="logo-banner">
    <img src="assets/img/banner.png" alt="The Misinformation Game Logo" />
</p>

--------

The Misinformation Game is a social media simulator built to study
how people interact with information on social media. To achieve
this, The Misinformation Game simulates a social media feed for
research participants. Participants are shown fake social
media post, either one at a time or in a feed format, and they may then react to the post and its
comments. The Misinformation Game has been designed to be highly
customisable so that a range oftightly controlled experiences can be created
for participants. This customisability is a core focus of The
Misinformation Game, to facilitate the research of a wide array of
social media related questions.

**Preprint Paper:** [PsyArXiv](https://psyarxiv.com/628wc/)

**Source Code:** [MisinformationGame Repository on GitHub](https://github.com/TheMisinformationGame/MisinformationGame)



## Example Game
{:#example-game}

If you would like to experience participating in a study created using
The Misinformation Game, you can access an example game from
[the example game page](/link/ExampleGame).
You can enter any ID to access the example game.

<figure id="fig1">
    <img src="screenshots/example-game.png" alt="figure 1" height="582" />
    <figcaption>
        <a href="#fig1">Figure 1.</a> Screenshot of the user interface within a game.
    </figcaption>
</figure>

<p class="spacer"></p>



## Example Results
{:#example-results}

If you would like to view an example of the results output for studies run using The Misinformation Game, the results of a user
experience study are available from
[the example results page](/link/ExampleResults). Additional
information about the results that are made available for your
analysis are described in the [Results Documentation](/Results).



## Getting Started
{:#getting-started}

The Misinformation Game contains many configuration options
to tailor the game for specific research purposes. To find
out whether The Misinformation Game is the right fit for
your research, we recommend that you first read through the
[How to Play](/HowToPlay) page and try the
[Example Game](#example-game). We then advise that you read
the available options for configuring your own study on the
[Study Configuration](/StudyConfiguration) page. Additionally,
the results that are made available for your analysis are
described on the [Results](/Results) page.

To conduct a study using The Misinformation Game, you will
need to host your own website for the game using
[Google Firebase](https://cloud.google.com/firestore/docs/client/get-firebase).
The steps to host your own instance of the game are described
in both a
[Non-Technical Installation Guide](/NonTechnicalInstallation)
and a [Technical Installation Guide](/TechnicalInstallation).
If you are proficient with the command-line and installing
technical tools, then the technical installation guide will
be quicker, and requires fewer steps. However, if you are
not familiar with these technologies, then the non-technical
installation guide should be easier to follow. Additionally,
while Firebase has a generous free tier, if you wish to run
large studies or studies with many images, then you should
consult the
[Firebase Pricing Documentation](/FirebasePricing) to estimate
your hosting costs. In our experience, the hosting costs for
the Misinformation Game have been minimal.



## Usage Documentation
{:#usage-docs}

- [How to Play](/HowToPlay) -
  The default guide given to participants before they start a study.
- [Study Configuration](/StudyConfiguration) - A reference guide on creating your own study.
- [Including Images in Studies](/Images) - Recommendations for including images in studies.
- [Registering Administrators](/Administrators) - How to securely assign administrator privileges.
- [Managing Studies](/ManagingStudies) - How to upload, enable, disable, and delete your studies.
- [Qualtrics Integration](/QualtricsIntegration) - How to integrate a study into Qualtrics.
- [Results](/Results) - A reference guide on the results that are recorded by the game.



## Hosting Documentation
{:#hosting-docs}

- [Firebase Pricing](/FirebasePricing) - A guide to estimate the hosting costs of running a study.
- [Non-Technical Installation Guide](/NonTechnicalInstallation) -
  A guide to host your own study using Firebase (longer, for non-technical users).
- [Technical Installation Guide](/TechnicalInstallation) -
  A guide to host your own study using Firebase (shorter, for technical users).
- [Updating your Installation](/Updating) -
  A guide to retrieve new features and fixes for your installation.



## System Documentation
{:#system-docs}

- [Technical Overview](/TechnicalOverview) - A broad overview of the tech-stack used by the game.
- [Simulation](/Simulation) - An in-depth description of the simulation behind the game.
- [Development](/Development) - A guide for developers to make adjustments to the game.
- [Documentation Development](/DocsDevelopment) - A guide for developers to make adjustments
  to this documentation website.
- [Original Design](/original-design) - The original, outdated, design document for the game.
  _This is only relevant for those who are interested, and not as a reference._



## Other Useful Links
{:#other-links}

- [Source Code](https://github.com/TheMisinformationGame/MisinformationGame) -
  The Misinformation Game is open-source!
- [The (Mis)information Game Paper](https://psyarxiv.com/628wc/) -
  A pre-print paper about The Misinformation Game, including a user experience study.
- [Issue Tracker](https://github.com/TheMisinformationGame/MisinformationGame/issues) -
  If you find any issues, please report them here.
- [Example Game](/link/ExampleGame) -
  Test out The Misinformation Game with an example game.
- [Example Results](/link/ExampleResults) -
  View the results of a user experience study ran using The Misinformation Game.
- [Study Configuration Template Spreadsheet](/link/StudyTemplate) -
  The template spreadsheet that should be edited to create your own study.
- [Example Game Configuration Spreadsheet](/link/ExampleStudy) -
  The study configuration spreadsheet that is used to create the example game.

## Cite the Misinformation Game

```bibtex
@misc{butler_lamont_wan_prike_nasim_walker_fay_ecker_2022,
 title={The (Mis)Information Game: A Social Media Simulator},
 url={psyarxiv.com/628wc},
 DOI={10.31234/osf.io/628wc},
 publisher={PsyArXiv},
 author={Butler, Lucy and Lamont, Padraig and Wan, Dean L Y and Prike, Toby and Nasim, Mehwish and Walker, Bradley and Fay, Nicolas and Ecker, Ullrich K H},
 year={2022},
 month={Jul}
}
```
