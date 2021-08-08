# Remaining Unknowns

1) Do we need to show users any disclaimers or legal notices
   related to using their data for research?
2) We currently have two methods of source selection. Completely
   random, or defined beforehand. Is this enough flexibility, or
   will more options be required? We could add an option to give
   each source a weight so that some sources are selected more
   than others.


# Overview

The Misinformation Game will be built as a web app so that it can be
accessed from desktop and mobile devices. Users will access a game URL
where they will be prompted with instructions for participating in a
social media simulation game. The game will show the users a mixture
of true and false social media posts, and the users will be prompted
to like, share, skip, dislike, or flag each post. Every interaction
of the user with these posts (except skipping) will influence their
own followers and credibility rating. For example, sharing true
posts may slowly grow the users followers and improve their
credibility, whereas sharing false posts may grow the users
followers very quickly, but reduce their credibility. The changes to
user's followers and credibility when they like, share, dislike, or
flag each post can be controlled by the researchers. Similarly, the
sources of each social media post will be randomised, and their
followers and credibility rating will also be changed throughout
the experiment. The posts that users have already seen will be
tracked throughout the experiment so that users are not shown
the same posts more than once.

Every game that is played by users is independent, and therefore users
interactions with the game will not affect one another. As users play
the game, their progress will be saved so that it can be later
downloaded as a CSV file by the researchers. This CSV file will
include the following information for every post that the user is
shown:
- The action that the user chose.
- The post that the user was shown, including its source, headline,
  text, and image.
- The current followers and credibility rating of the source.
- The current followers and credibility rating of the user before
  they interacted with the post.

The researchers will access these CSV files through an admin
interface. There will need to be a method of authenticating
researchers to restrict access to the admin page, and another
way to grant new researchers access. The admin page will display a
list of all studies that have been uploaded to the system. The
researchers will then be able to open any study, which will take
them to a separate page where they can download the results
from participants in the study. These results will be formatted
as a ZIP archive containing a folder with a CSV file for every
participant.

The admin page will also provide functionality for researchers to
upload new studies, and update existing studies. This will be
achieved through an Excel template that researchers can edit with
the details of the study, which can then be uploaded through the
admin page. This Excel template will contain the following
information:
- A name for the study.
- A description for the study.
- The prompt that the user will be shown before they start the game.
- The sources to be included in the game, including:
  - Name.
  - Avatar Image.
  - Ratio of true and false posts.
  - Initial followers mean and std. deviation.
  - Initial credibility rating mean and std. deviation.
- The posts to be included in the game, including:
  - Headline.
  - Content image or text.
  - Changes to followers for liking, disliking, sharing, or
    flagging the post.
  - Changes to credibility for liking, disliking, sharing, or
    flagging the post.
- Whether an exact order of sources and posts should be used.
- The exact order of source/post pairs to display to the user.
  These could either reference the sources and posts that were
  included previously via some ID (e.g. row number), or else it
  could include all of their properties directly
  (e.g. source name, post headline, post image, etc...).


# UI Design

The web app must be designed to be accessible from both desktop and
mobile devices, and therefore it should follow a responsive design.


### Optional User Identification Screen Mockup
This screen allows users to identify themselves by entering an
identification number that will be saved in their results CSV.
This page can be enabled or disabled for each study.

<img src="https://github.com/deanlawyw/CITS3200-Project/blob/main/docs/user-identification-mockup.png" height="320" />

### Help / Introduction Screen Mockup
This screen is used to introduce the study, and teach users how to
participate and interact with the game.

<img src="https://github.com/deanlawyw/CITS3200-Project/blob/main/docs/help-mockup.png" height="320" />

### Prompt Screen Mockup
This screen is used to present the researcher's prompt to the users
participating in the study.

<img src="https://github.com/deanlawyw/CITS3200-Project/blob/main/docs/prompt-mockup.png" height="320" />

### Game Screen Mockup
This screen is where users are able to actually participate in the
social media game and view their progress.

<img src="https://github.com/deanlawyw/CITS3200-Project/blob/main/docs/game-mockup.png" height="320" />

### Admin Dashboard Mockup
This screen allows researchers to view all studies that have been
uploaded, along with some information about each of them. It also
allows them to upload a new study, and go to a page with more
information about each study.

<img src="https://github.com/deanlawyw/CITS3200-Project/blob/main/docs/admin-dashboard-mockup.png" height="320" />

### Admin Study Mockup
This screen presents the information about the selected study, and
allows researchers to download all results from the participants in
the study.

<img src="https://github.com/deanlawyw/CITS3200-Project/blob/main/docs/admin-study-mockup.png" height="320" />


# Technical Considerations

This section outlines ideas and considerations for the
implementation of the web app, and is subject to change
during development.

### Languages and Frameworks
We will use the languages most standard for building websites
today. This includes JavaScript, HTML, and CSS. Due to the
simplicity of the web app, we will not include any large
UI frameworks to begin with. This is because we do not have
any team members with experience with any of these frameworks
(e.g. react). Therefore, we do not know if their inclusion
will be worth the time we would all have to spend learning
them. Instead, we will begin the project using vanilla
JavaScript, and only adopt a framework later if we find
that one would give us a lot of benefit.

### Firebase
The current plan is to use Firebase for the backend of our
web app. This means that we will need to setup a firebase
application, and sort out some way to get it hosted. To
begin with we will definitely fall into the free tier of
Firebase, but in the future a paid plan may be required.

### Study URLs
Each study should have their own URL that the researchers can
share with participants for them to access. To achieve this,
each study should be given a unique ID, and then the URLs can
just include this ID.

e.g. _game.firebaseapp.com/study?id=abcde123_ or
_game.firebaseapp.com/study/abcde123_

### Data Storage

**Storing the studies:**

To begin with, I think we will be able to get away with just
uploading the whole study as a single object in the database.
This way the client can just load the whole study at once
and then never worry about loading data from the database
again for the duration of the game.

This is simple, however if the studies get large this may
become too slow. In that case, we may have to split the
sources and posts in the studies into their own
sub-collections in Firestore, and then only load them as
they are needed.


**Storing the participant results:**

I think it will be simplest if we construct the CSV for
user's results on the client-side as they play the game.
This CSV file could then be uploaded to the database every
few posts that the user interacts with, replacing the
previous CSV for their current session. This means that
we will still save user's progress even if they randomly
close their tab.

It would also be really nice if we didn't lose participant's
progress when they reloaded the game. This could be achieved
by storing some ID for the sessions in the URL or session
storage in the browser, and then downloading their current
progress when they reload the tab.

### Reading Excel Spreadsheets
The JavaScript library
[ExcelJS](https://www.npmjs.com/package/exceljs)
can be used to read Excel spreadsheets from within the client's
browser. I believe this will be a good approach for us to read
the study spreadsheets, as it will allow us to perform validation
of the spreadsheets before uploading them to Firebase. After
parsing, the information for the study can then be uploaded
to the database.

Additionally, it appears as though that library will support
reading images from within cells. Therefore, we can also embed
the avatar and post images directly into the spreadsheet which
I think will be easier to use.

### Testing
We will need to write tests for our web app as part of this
project. I think a good option for this will be to write
integration tests. The [Selenium](https://www.selenium.dev/)
library works well for automating these types of website
tests. It would also be good to write some unit tests.
