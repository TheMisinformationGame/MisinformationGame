---
title: Study Configuration
showPath: true
---

# Creating your own studies
Studies in The Misinformation Game are configured through the
use of Google Sheets spreadsheets. These spreadsheets contain
all settings for your study in one place, including all images
to be included in your study.

**The configuration spreadsheet cannot be opened in Microsoft
Excel.** It is built specifically for use in Google Sheets,
and uses functionality that is not available in Microsoft
Excel.

# Table of Contents
* [1. ✏ Create a new Spreadsheet](#1--create-a-new-spreadsheet)
* [2. 📜 Enter your study settings into the Spreadsheet](#2--enter-your-study-settings-into-the-spreadsheet)
    - [📄 About Sheet](#21--about-sheet)
    - [📄 Overview Sheet](#22--overview-sheet)
    - [📄 General Sheet](#23--general-sheet)
    - [📄 Pages Sheet](#24--pages-sheet)
    - [📄 Source & Post Selection Sheet](#25--source--post-selection-sheet)
    - [📄 Sources Sheet](#26--sources-sheet)
    - [📄 Posts Sheet](#27--posts-sheet)
* [3. 📤 Uploading your Study](#3--uploading-your-study)


# 1. ✏ Create a new Spreadsheet
Before you can start configuring your study, you will first
need to create a new spreadsheet for the study in Google
Sheets. You can create a new spreadsheet by either copying
the Study Template spreadsheet that is already on Google
Sheets, or by uploading the Study Template file.

## Method 1: Copy the Template (Recommended)
You can access the Study Template spreadsheet on Google Sheets
[here](https://docs.google.com/spreadsheets/d/1BeJ2krpg_lDG8dnq5n4Gqopin2NBhVbDyTDdsplbVUY).
After you have loaded the template spreadsheet, you can select
**_File_** -> **_Make a copy_** to clone the spreadsheet so that
you can make changes.

## Method 2: Upload the Template
You can download the Study Template file from
[StudyTemplate.xlsx](StudyTemplate.xlsx). This file can then
be uploaded to your Google Sheets using the following steps:

**Step 1:** Access Google Sheets at
[https://sheets.google.com](https://sheets.google.com).

**Step 2:** Select the **_Blank_** option to start a new
spreadsheet.

**Step 3:** Select **_File_** -> **_Import_** -> **_Upload_**
-> **_Select a file from your device_**.

**Step 4:** Use the file chooser to select the
[StudyTemplate.xlsx](StudyTemplate.xlsx) file that you
downloaded to upload.

**Step 5:** Select the **_Import Location_** to be
**_Replace spreadsheet_**.

**Step 6:** Click **_Import Data_**.

Your spreadsheet should now contain everything you need
to create your new study.

# 2. 📜 Enter your study settings into the Spreadsheet
The configuration spreadsheet may look intimidating at
first glance, and so this section will try to break
down the configuration spreadsheet sheet-by-sheet.
The sheets are roughly ordered in the same order as
you may want to fill in the data for your study,
however you are free to jump back and forth as you
configure your study.


## 2.1. 📄 About Sheet
The _About_ sheet gives an overview of the structure of
the spreadsheet, with a short description of each sheet in
the spreadsheet. It also contains a legend for what the
different colour codes mean throughout the spreadsheet.
The colour codes for cells are used to signify cells that
should be edited, cells that are generated, and cells that
you should read for help. Taking a look through the legend
will help when reading the rest of the configuration
spreadsheet.


## 2.2. 📄 Overview Sheet
The _Overview_ sheet provides a summary of all the settings
that have been entered. It also collates all the errors
between all the sheets into one place, so that you can
easily identify if there are any errors in your
configuration.

### 2.2.1. Status
The status of the spreadsheet gives an indication of
whether there are any errors in the spreadsheet. If
there are any errors in any of the sheets, an error
will be shown here.

### 2.2.2. Opened in Google Sheets
This attempts to detect whether the spreadsheet was
opened in Google Sheets, and will error if it can
detect that it was opened in Microsoft Excel. This
detection uses a bug when converting between Google
Sheets and Microsoft Excel, and it therefore may not
be 100% accurate.

### 2.2.3. General Settings
This section gives an overview of the general settings
of your study, as well as their validity in the top-left.
The **Pages** value will show the exact order of pages
that participants will be shown when they participate
in your study.

### 2.2.4. Sources
This will show the validity of all the sources you have
entered, and includes the number of sources that have been
included in the _Sources_ sheet.

### 2.2.5. Posts
This will show the validity of all posts, as well as the
number of true and false posts that have been included
in the _Posts_ sheet.

If there are fewer true or false posts than the length of
the study, a warning will be shown. This warning is shown
as it is possible that the post selection will try to select
a true post but fail due to having already shown all the
true posts (depending on settings; see the 
[Simulation Documentation](Simulation.md) for details). 
The post selection will instead have to display
a false post in this case. This could lead to a false post
being shown, even if the true post percentage is 100%.


## 2.3. 📄 General Sheet
The General sheet is the best place to start when creating
a study. It contains all the most broad settings of
studies including their name, description, and length.

### 2.3.1. Basic Settings

This section contains the most basic settings that likely
should be changed for each study.

<span class="param-name">Name</span>
The name of your study is used to identify it in your
admin dashboard. This name is not shown to participants.

<span class="param-name">Description</span>
The description of your study is used to include
information about the study in your admin dashboard.
This description is not shown to participants.

<span class="param-name">Prompt</span>
The prompt text to be shown to participants before they
start the study. An example prompt is shown below.

<img src="screenshots/example-prompt.png" alt="Example prompt" height="250"/>

<span class="param-name">Length of Game</span>
The exact number of posts to show to participants before
they complete the study. The length of studies must
be at least 1 post.

<span class="param-name">Require Reactions</span>
Whether to require participants to react to every post.
Participants will still be able to skip posts, but to
do so they will have to explicitly select "Skip Post"
as their reaction.

<span class="param-name">Require Comments</span>
Whether comments made by the participants are required
for each post, optional for each post, or disabled
entirely.

<span class="param-name">Require Participant Identification</span>
Whether participants will be required to provide a
participant ID before starting the study. If this value
is true, then participants will be shown an identification
screen for them to manually enter their ID if it has not
already been automatically populated from the URL they
have been given.

### 2.3.2. User Interface Settings

This section contains the settings that change the user
interface of The Misinformation Game for participants.
These options change the way that participants are able
to interact with your study.

<span class="param-name">Display Followers</span>
Whether to show followers to participants. This includes
the followers of both sources and participants.

<span class="param-name">Display Credibility</span>
Whether to show credibility to participants. This includes
the credibility of both sources and participants.

<span class="param-name">Display Progress</span>
Whether to show participants the number of posts they
have reacted to, and how many they have remaining
(e.g. "Post 51 of 100").

<span class="param-name">Display Number of Reactions</span>
Whether to show the ostensible number of prior reactions
to posts and comments adjacent to the reaction buttons.

<span class="param-name">Post Likes Enabled</span>
Whether to allow participants to like posts.

<span class="param-name">Post Dislikes Enabled</span>
Whether to allow participants to dislike posts.

<span class="param-name">Post Shares Enabled</span>
Whether to allow participants to share posts.

<span class="param-name">Post Flags Enabled</span>
Whether to allow participants to flag posts.

<span class="param-name">Comment Likes Enabled</span>
Whether to allow participants to like comments.

<span class="param-name">Comment Dislikes Enabled</span>
Whether to allow participants to dislike comments.

### 2.3.3. Advanced Settings

These settings can be used to fine-tune your study.
It is unlikely that you will need to edit these settings.

<span class="param-name">Minimum Comment Length</span>
The minimum number of characters that participants must
enter for their comments. The minimum length of comments
must be at least 1 character.

<span class="param-name">Prompt Continue Delay (Seconds)</span>
The period of time in which participants are not able
to continue past the prompt page to start the game.
This delay cannot be negative, but it can be zero.

<span class="param-name">Next Post Delay (Seconds)</span>
The period of time after the current post is shown
in which participants are not able to continue to
the next post. This delay cannot be negative, but
it can be zero.

<span class="param-name">Generate Completion Code</span>
Whether to generate and display a completion code
to participants once they have completed the study.
An example debriefing page that includes a generated
completion code for a participant is shown below,

<img src="screenshots/example-debriefing-no-border.png" alt="Example debriefing page" height="140" />

<span class="param-name">Completion Code Digits</span>
The number of digits to generate for the completion
code (e.g. If this value is 4, then completion codes
from 1000 to 9999 will be generated). The number of
digits in completion codes must be at least 1.

## 2.4. 📄 Pages Sheet
The _Pages_ sheet allows you to edit the content of
the instructions and debriefing that the users may be
shown. It also allows you to edit the enforced delays 
(with disabled continue button) on these pages.

### 2.4.1. Formatting the Text
The text on these pages can be formatted to include **bold**,
_italic_,
<span style="font-size: 1.2em">larger text</span>,
<span style="font-size: 0.8em">smaller text</span>,
<span style="color: purple">coloured text</span>,
or any other formatting that is available in Google Sheets.
This formatting will be converted to HTML to be shown to
participants. Your text can also be moved onto new lines by 
pressing **_Alt + Enter_**. This is equivalent to typing
**_Enter_** in most text editors.

If there are not as many formatting options as you need,
then you can also include HTML markup in the text.

### 2.4.2. Introduction before game rules
This page will be shown to participants after they have
identified themselves, and before they are shown the
rules of the game. This page can be used for instructions. 
It is _optional_, so if you do not wish to show participants 
an introduction before they are shown the game rules, then 
leave this page blank.

### 2.4.3. Introduction after game rules
This page will be shown to participants after they have
been shown the rules of the game. This page can also be 
used for instructions. It is _optional_, so if you do not 
wish to show participants an introduction after they are 
shown the game rules, then leave this page blank.

### 2.4.4. Debriefing
This page will be shown to participants after they have
completed the study. This page is not optional. An
example of this debriefing screen is shown below,

<img src="screenshots/example-debriefing-no-border.png" alt="Example debriefing page" height="140" />


## 2.5. 📄 Source & Post Selection Sheet
The Source & Post Selection sheet allows you to edit the
method that is used to select the source/post pairs that
will be shown to participants in their games. There are
four options for source/post selection: **Overall-Ratio**,
**Source-Ratios**, **Credibility**, and **Pre-Defined**.

In-depth descriptions of each selection method are available
in the [Simulation Documentation](Simulation.md).

### 2.5.1. Selecting a Method
The **Source & Post Selection Method** value at the top of
this sheet should be changed manually to the name of the method 
to be used. This should be one of _Overall-Ratio_,
_Source-Ratios_, _Credibility_, or _Pre-Defined_. Once you
have entered your desired source/post selection method, the
settings for all the other selection methods will be
disabled.

### 2.5.2. Method 1: Overall-Ratio
Sources will be selected randomly, and the associated
post will be chosen to match an overall ratio of
true:false posts. The settings for this method are
available in the **Overall-Ratio Settings** section.

<span class="param-name">True Post Percentage</span>
The percentage of true posts to display to users. This
percentage is used to probabilistically sample posts.
Therefore, the actual percentage for each participant
will differ from this value. However, the percentage
of true posts shown to all participants collectively
should approach this value.

### 2.5.3. Method 2: Source-Ratios
Sources will be selected randomly, and the associated
post will be chosen to match the **True Post Percentage**
defined for each source.

Similarly to _Method 1_, this does not guarantee that
an exact percentage of true posts will be shown for each
source in one game. However, over all games played, the
actual percentage of true posts that a source is selected
to show should approach their defined **True Post Percentage**.

### 2.5.4. Method 3: Credibility
Sources will be selected randomly, and then a **True Post
Percentage** will be calculated from the credibility of
the source. The ratio will then be used to sample a true
or false post to display alongside the source. The
relationship between the source's credibility and the
true-post percentage to be used is a linear relationship.
The parameters of the linear relationship between the two
can be configured under the **Credibility Settings** section.

<span class="param-name">Linear Slope</span>
The increase in the **True Post Percentage** for every unit
increase in a source's credibility.

<span class="param-name">Linear Intercept</span>
The **True Post Percentage** to use when a source's
credibility is zero.

### 2.5.5. Method 4: Pre-Defined
An exact set of source/post pairs is manually defined.
The source/post pairs can be manually defined in the
_Pre-Defined Source & Post Order_ sheet, alongside
other settings for this method.

<span class="param-name">Randomise Order</span>
Whether the presentation order of the pairs should
be randomised. Otherwise, the pairs will be shown
in the exact order specified.

<span class="param-name">Source ID</span>
The ID of the source to be used for the post (e.g. **S1**).
These IDs can be found in the _Sources_ sheet.

<span class="param-name">Post ID</span>
The ID of the post to display (e.g. **S1**).
These IDs can be found in the _Posts_ sheet.


## 2.6. 📄 Sources Sheet
The _Sources_ sheet allows you to add all the sources that
can be shown to participants during your study. Each source
contains several settings to define their appearance and
behaviour. An example source for a post is shown below,

<img src="screenshots/example-source.png" alt="An example source in the game interface" height="76" />

The top of the _sources_ sheet contains documentation
about all the settings that can be defined for each source.
To the right there is also a widget that can be used to
preview the settings for your sources.

### 2.6.1. Default Source Values
This section defines defaults for some source parameters
to avoid repetition in entering values that are constant
for most sources. If one of the parameters that has a
default is not included for a specific source, the default
value will be used instead.

The _Default Source Values_ allows you to define normal
distributions for the initial number of followers and 
credibility scores of sources. This random sampling of
the initial number of followers and credibility for
sources is not available on a per-source basis. The normal
distributions for the initial credibility and followers is
configured by setting the mean and standard deviation of
the distributions. These values are then used to sample
the initial credibility and followers of sources from a
normal distribution with that mean and standard deviation
when a new game is started.

The sampling of initial credibility values is truncated to
between 0 and 100 credibility. The sampling of initial
follower count values is also truncated such that source's
follower counts are never negative, and are always within
5 standard deviations of the mean. The 5 SD constraint
is used to avoid random huge deviations from the expected
distribution. The chances of a value being selected outside
the mean +/- 5 SD is tiny (0.00006%), and therefore this
should not affect the shape of the distributions noticeably.

An example preview of the distributions of the follower
count and credibility for a source is shown below,

<img src="screenshots/example-config-source-preview.png" alt="An example source in the game interface" height="484" />

### 2.6.2. Sources Table
The table below the Default Source Values is where the sources 
in the study can be added. Each row in this table represents
one source. The **ID** and **Name** of each source is required
(although the **ID** should be pre-filled already). The remaining
settings are optional, and if they are omitted the default settings
are used instead. If an **Avatar** for a source is omitted, it will
use a default based upon the **Name** of the source instead.

<span class="param-name">Source ID</span>
The ID's of sources are used to uniquely identify them. For example,
the ID of a source will be used to reference it in the results of
a study. The ID's of the sources should be of the form `Sx`, where
`x` is an increasing integer (e.g. `S1`, `S2`, `S3`, etc...). In the
template sheet, all the IDs are already filled in, and you should not
have to edit them.

<span class="param-name">Name</span>
The name of the source will be shown to participants when this source
is used alongside a post.

<span class="param-name">Avatar</span>
The avatar of a source is an optional image that is displayed in a circle
alongside the source. If the avatar is not square, it will be cropped.
The avatar images are only shown at small sizes, and therefore are
recommended to have the dimension of 96⨯96 pixels. Recommendations for
image file formats, downscaling your images, and compressing your images
are all described in the [Including Images in Studies](/Images) documentation.

The avatar image must be inserted into the spreadsheet using the **Insert**
menu at the top of the page on Google Sheets. You must first select the cell
where you want to insert the avatar image, and then select **Insert** ->
**Image** -> **Image in cell**. If you do not use this procedure, then The
Misinformation Game may not be able to find the image to use for the avatar.

<img src="diagrams/inserting-image.png" alt="How to insert an image" height="275"/>

<span class="param-name">Max Posts</span>
The maximum posts for a source allows you to set a hard limit on the number
of times a source is shown to the participant. This value can either be an
integer greater than or equal to zero, or the text `Unlimited` to represent
that there is no maximum number of posts for this source.

The Max Posts value is also used to weight the random
selection of sources to be shown to participants. Sources
with a higher Max Posts value will have a higher chance of 
being selected than sources with a low Max Posts value. 
Sources with a Max Posts of `Unlimited` will be weighted 
with the mean weighting of all sources with a Max Posts value.
Therefore, if you wish one source to show up more than others, 
but do not wish to limit the number of times other sources can 
be selected, you can use high values of Max Posts (e.g. a 
source with Max Posts = 100 will be selected 10x more than a 
source with Max Posts = 10).

<span class="param-name">Initial Followers</span>
This optional value lets you set an exact initial
follower count for this source. However, the actual
follower count of the source may differ throughout
participant's games (see the [Simulation](/Simulation)
page for details).


<span class="param-name">Initial Credibility</span>
This optional value lets you set an exact initial
credibility number for this source. However, the actual
credibility number of the source may differ throughout
participant's games (see the [Simulation](/Simulation)
page for details).

This value lets you set an exact
credibility number for this source to start with.

<span class="param-name">True Post Percentage</span>
When using the _Source-Ratios_ source/post selection method,
this value is used to define the percentage of true posts that
this source should show. After this source is selected, this
will indicate the probability of it being paired a true post
rather than a false post.


## 2.7. 📄 Posts Sheet
The _Posts_ sheet allows you to add all the posts that could
be shown to participants during the game. Each post can
only be shown to a participant once, and will never be
repeated.

The top of the sheet contains documentation about all
the settings that can be defined for each post. To
the right there is also a table to display the total
number of true and false posts that you have entered.

### 2.7.1. Default Post Values
This section defines separate defaults for true posts and 
false posts. This is done so that consistent behaviour can be 
configured for true posts increasing credibility and false 
posts decreasing credibility (if that behavior is desired). 
The default values allow specification of normal
distributions for the changes to participants' followers and
credibility after they _like_, _dislike_, _share_, or _flag_ 
a post.

### 2.7.2. Posts Table
The table below the Default Post Values allows you to enter
all the posts that may be shown to participants during the
study. Each row in the table represents one post. The
**ID**, and the **Is True** columns are the only required
columns for each post. However, one of **Headline**
_and/or_ **Content** must also be included. The remaining
settings for changes to followers and credibility, and
comments, are optional. If the changes to followers and
credibility are omitted, the default settings will be
used instead.

<span class="param-name">Post ID</span>
The ID of each post is used to uniquely identify
the post. This ID should be of the form `Px` where x is
an increasing integer (e.g. P1, P2, P3, etc...). This ID
will be used in the results to refer to this specific post.
In the template sheet, all the IDs are already pre-filled,
and there should be no need to edit them.

<span class="param-name">Headline</span>
The headline of the post is used to provide a title above the
content of the post. This headline is optional, and if it is
not included then only the content of the post will be shown.

<img src="diagrams/post-headline-content.png" alt="Post with headline and content highlighted" height="250"/>

<span class="param-name">Content</span>
The content of the post is used to provide a  more substantial
piece of text, or an image to display to participants. The content 
is optional, and if it is not included then only the headline of
the post will be shown. The content can be either a piece of text
_or_ an image, but it cannot contain both.

If an image is used, then it is recommended to have a width of
600 pixels. For a typical landscape image, this would lead to
an approximate dimensions of 600⨯340 pixels. Recommendations for
image file formats, downscaling your images, and compressing your
images are all described in the [Including Images in Studies](/Images)
documentation.

Images must be inserted using the same procedure for inserting Avatar
images into the spreadsheet. The content image must be inserted into
the spreadsheet using the **Insert** menu at the top of the page on
Google Sheets. You must first select the cell where you want to insert
the content image, and then select **Insert** -> **Image**
-> **Image in cell**. If you do not use this procedure, then The
Misinformation Game may not be able to find the image to use for the
content.

<img src="diagrams/inserting-image.png" alt="How to insert an image" height="275"/>

<span class="param-name">Is True</span>
This should be set to whether the post should be considered true or false.
This value is used for the post selection, and for choosing the default
settings to use for the post. This value is never shown to participants.

<span class="param-name">Changes to Followers</span>
These settings allow you to
set the exact change to a participant's followers after
they _like_, _dislike_, _share_, or _flag_ a post. If
these values are left blank, the changes to a participant's
followers will be sampled from the default distributions
instead.

<span class="param-name">Changes to Credibility</span>
These settings allow you to
set the exact change to a participant's credibility after
they _like_, _dislike_, _share_, or _flag_ a specific post. 
If these values are left blank, the changes to a participant's
credibility will be sampled from the default distributions
instead.

<span class="param-name">Comments</span>
Up to three optional comments can be configured
for each post. Each comment must include both a _Source Name_
and a _Message_, which are described below.

<img src="screenshots/example-comment.png" alt="Example comment in the game interface" height="100" />

<span class="param-name">Comment Source Name</span>
This value is the name to use as
the source of the comment.

<span class="param-name">Comment Message</span>
This value is the text of the comment
to display.

<span class="param-name">Comment Likes</span>
This value is not used. In the future,
there are plans to add likes to posts and comments,
however this feature is not fully implemented yet.


# 3. 📤 Uploading your Study
Once you have completed configuring your study, it is recommended
you first check the **Overview** sheet to make sure that
everything looks correct, and doesn't contain any errors.

The configuration spreadsheet can then be downloaded as an .xlsx 
file to upload to The Misinformation Game. This can be done by 
selecting **File** -> **Download** -> **Microsoft Excel (.xlsx)**. 
The name suggests that this spreadsheet is only meant for Microsoft 
Excel, but .xlsx is a general-purpose spreadsheet file format.

<img src="diagrams/exporting-config-spreadsheet.png" alt="How to export the configuration spreadsheet" height="250"/>

Once you have downloaded your study configuration as an
.xlsx file, you can then upload it through The Misinformation
Game admin dashboard by clicking the **Upload New Study**
button. This will open a window where you can click
**Upload Spreadsheet** to select the .xlsx file to upload.

If there are any errors that could be found with your study,
then an error will be displayed in this window. Otherwise,
a success message will be displayed, and you will be redirected
to the admin view of your new study.
