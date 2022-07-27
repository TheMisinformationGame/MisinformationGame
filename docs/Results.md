---
title: Results
showPath: true
showBackToTop: false
---

# The Results Spreadsheet
{:#intro}

The results for studies can be downloaded from the Admin
Dashboard, by selecting your study, and then selecting
**Download Results**. The results are downloaded as a
spreadsheet that may be opened in any spreadsheet program
such as Google Sheets or Microsoft Excel. The results spreadsheet
is split into four worksheets:

1) **[The Overview Worksheet](#overview):** This sheet contains information about the
   study that the results are from, the number of participants,
   and when the results were downloaded.

2) **[The Posts Worksheet](#posts):** This sheet contains all the reactions of
   participants to the posts that they were shown. It also
   includes the number of followers and the credibility score of 
   the source that shared the post, and the participant, as well 
   as the time it took the participant to react to the post.

3) **[The Comments Worksheet](#comments) _(optional)_:** This sheet contains the reactions
   of participants to comments on posts. If no participants reacted to a comment,
   then the reaction column will be left blank. If your study contains no comments,
   then this sheet will not be included.

4) **[The Participants Worksheet](#participants):** This sheet contains a list of all the
   participants in the study, when they completed the study,
   and their completion codes.


### Example Results
{:#example-results}

If you wish to view some example results from a user experience
study ran using The Misinformation Game, then they may be accessed
from [the example results page](/link/ExampleResults).



## 1. Overview Worksheet
{:#example-results}

**Study ID:** The identification number used in the URL of
the study to identify it. It is unique for each study.

**Study Name:** The name that was configured in the
configuration spreadsheet for the study.

**Participants:** The number of participants that completed
the study.

**Results Download Time (UTC):** The date and time that
the results were downloaded, in UTC time.



## 2. Posts Worksheet
{:#posts}

**Session ID:** The session ID can be used to uniquely
identify the reactions of a participant in their play-through
of the game. The session ID is always available, and it is
unique for every participant.

**Participant ID:** The ID that the participant entered when
starting the study, or that was filled in for them through the
URL. The participant ID is _not_ guaranteed to be unique, as
multiple participants could enter the same participant ID. It
is also not guaranteed to be present if the study has been
configured to not require identification.

**Post Order:** A number starting from 1 that represents when
the participant was shown the post associated with this row of
the results. For example, a Post Order of 1 would represent the
first post shown to a participant, and a Post Order of 4 would
represent the fourth post the participant was shown.

**Post ID:** The post identifier of the post that was shown to
the participant. It is the same ID that was specified in the
study configuration spreadsheet.

**Source ID:** The source identifier of the source that was
shown to the participant. It is the same ID that was
specified in the study configuration spreadsheet.

**Source Followers:** The number of followers of the source
as shown to the participant for this post.

**Source Credibility:** The credibility of the source as
shown to the participant for this post.

**Participant Credibility Before:** The credibility of the
participant before they reacted to this post.

**Participant Followers Before:** The number of followers of the
participant before they reacted to this post.

**Participant Credibility After:** The credibility of the
participant after they reacted to this post.

**Participant Followers After:** The number of followers of the
participant after they reacted to this post.

**Reaction:** The reaction that the participant chose
for this post. This can be one of `like`, `dislike`,
`share`, `flag`, or `skip`.

**First Time to Interact (MS):** The time from post onset
to an initial response to the post being selected, in
milliseconds. If the participant changes their reaction,
this number will not change.

**Last Time to Interact (MS):** The time from post onset
to the participant clicking continue, in milliseconds.

**Credibility Change:** The change to the participant's
credibility after they reacted to this post.

**Follower Change:** The change to the participant's
follower number after they reacted to this post.



## 3. Comments Worksheet
{:#comments}

**Session ID:** The session ID can be used to uniquely
identify one play-through of the game by a participant. This
session ID is the same session ID as used in the **Results**
sheet. The session ID is always available, and it is unique
for every participant.

**Participant ID:** The ID that the participant entered when
starting the study, or that was filled in for them through the
URL. The participant ID is _not_ guaranteed to be unique, as
multiple participants could enter the same participant ID. It
is also not guaranteed to be present if the study has been
configured to not require identification.

**Post Order:** A number starting from 1 that represents when
the participant was shown the post associated with this row of
the results. For example, a Post Order of 1 would represent the
first post shown to a participant, and a Post Order of 4 would
represent the fourth post the participant was shown.

**Post ID:** The post identifier of the post that was shown to
the participant. It is the same ID that was specified in the
study configuration spreadsheet.

**Comment Order:** A number starting from 1 that identifies the
order in the post, that the comment is shown. For example, a
value of 3 would indicate that the comment is the third comment
displayed.

**Comment Text:** A text cell which contains the text of the
comment that is displayed.

**Comment Likes:** A number which represents the number of likes
that the comment has, when it is displayed to the participant.

**Comment Dislikes:** A number which represents the number of
dislikesthat the comment has, when it is displayed to the
participant. 

**Reaction:** The reaction that the participant chose
for this comment. This can be one of `like` or `dislike`.
_Note:_ A blank value indicates that there was no reaction
to the comment.

**Reaction Time (ms):** The time from post onset
to an initial response to the comment being selected, in
milliseconds. _Note:_ A blank value indicates that there
was no reaction to the comment.



## 4. Participants Worksheet
{:#participants}

**Session ID:** The session ID can be used to uniquely
identify one play-through of the game by a participant. This
session ID is the same session ID as used in the **Results**
sheet. The session ID is always available, and it is unique
for every participant.

**Participant ID:** The ID that the participant entered when
starting the study, or that was filled in for them through the
URL. The participant ID is _not_ guaranteed to be unique, as
multiple participants could enter the same participant ID. It
is also not guaranteed to be present if the study has been
configured to not require identification.

**Completion Code:** The code that the participant was shown
when they completed the study.

**Game Start Time (UTC):** The time when the participant
first accessed the game and entered their ID, in UTC time.

**Game Finish Time (UTC):** The time when the participant
completed the study (before being shown the debriefing), in UTC
time.

**Study Modification Time (UTC):** The time when the
study was last updated, in UTC time. When a study is enabled
or disabled, or when the contents of a study are updated, this
value will change. Therefore, if a study is re-run multiple
times, and disabled in-between, this value can be used to
differentiate runs.
