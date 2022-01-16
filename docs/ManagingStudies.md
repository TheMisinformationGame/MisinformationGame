---
title: Managing Studies
showPath: true
---

# Managing Studies
This document outlines the general processes to manage
your studies using The Misinformation Game after you
have uploaded them.

## Accessing the Admin Study View
To manage your study, you must first navigate to the
admin dashboard page, as shown below:

<img src="screenshots/example-admin-dashboard.png" alt="Admin Dashboard" height="280" />

From this screen, you can then select the study that
you wish to manage. This will open another view like
the one below:

<img src="screenshots/example-admin-study.png" alt="Admin Study View" height="420"/>

## Enabling and Disabling your Study
In the _Admin Study View_ for your study, there will be either
a button to **Enable Study** in green, or a button to
**Disable Study** in orange. Pressing these buttons will ask
you to confirm whether you wish to enable or disable your study.

Studies that are enabled will be accessible to participants
with the URL of the study. Once the study is disabled however,
participants will no longer be able to access the study.

Enabling or disabling your study will also update its **Last
Study Modification Time**, which is saved into the results.
This timestamp will allow you to distinguish between your
test runs through the study while it was disabled, and the
participant's runs through the study after you enabled it.

## Downloading Results
You can download the results of your study from the
_Admin Study View_ for your study by clicking the
**Download Results** button. This will download all
the results of the study and generate an Excel
spreadsheet with the results. More information on
the format of these results can be found in the
[Results](Results) documentation.

## Updating your Study
If you have found changes you wish to make to your
study after you tested playing through it, you may
wish to upload a new version of your study. This
can be done by pressing the **Update Study** button
and selecting the new version of your configuration
spreadsheet that you wish to upload.

Note, this updating should not be done while
participants are taking part in your study, as it
is possible that it will break their game.

## Deleting your Study
Once you have finished conducting your study and you
have downloaded the results of your study, you may
wish to delete your study from The Misinformation Game.
This can be done by pressing the **Delete Study** button
for your study from the _Admin Study View_. This deletion
will delete everything to do with your study, including
its settings, all its images, and all its results. The
results will not be recoverable after the study has been
deleted.

## Accessing the URL to send to participants
The URL to send to participants is shown below the name
of the study at the top of the _Admin Study View_. This
URL can also be used for you to access your game to test
it before you enable the study.

If you are using another system to redirect participants
to your game, some of them may also support automatically
passing the ID of participants to the game. This can be
done by including `?id=<PARTICIPANT ID>` at the end of
the URL, where `<PARTICIPANT ID>` should be replaced by
the ID of the participant.
