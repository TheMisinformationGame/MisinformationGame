# Results
The results for studies can be downloaded from the Admin
Dashboard, by selecting your study, and then selecting
**Download Results**. The results are downloaded as a
spreadsheet that may be opened in any spreadsheet program
such as Google Sheets or Microsoft Excel.

The results spreadsheet is split into three sheets:
1) **Overview:** This sheet contains information about the
   study that the results are from, the number of participants,
   and when the results were downloaded.
2) **Results:** This sheet contains all the reactions of
   participants to the posts that they were shown. It also
   includes the followers and credibility of the source that
   shared the post and the participant, as well as the time
   it took the participant to react to the post.
3) **Participants:** This sheet contains a list of all the
   participants in the study, when they completed the study,
   and their completion code.

# 1. Overview Sheet

**Study ID:** The identification number used in the URL of
the study to identify it. It is unique for each study.

**Study Name:** The name that was configured in the
configuration spreadsheet for the study.

**Participants:** The number of participants that completed
the study.

**Results Download Time (UTC):** The date and time that
the results were downloaded, in the UTC timezone.

# 2. Results Sheet

**Session ID:** The session ID can be used to uniquely
identify the reactions of a participant in their play-through
of the game. The session ID will always be available, and it
is unique for every participant.

**Participant ID:** The ID that the participant entered when
starting the study, or that was filled in for them through the
URL. The participant ID is _not_ guaranteed to be unique, as
multiple participants could enter the same participant ID. It
is also not guaranteed to be present if the study has been
configured to not require identification.

**Post Order:** A number starting from 1 that represents when
the participant was shown this row of the results. For example,
a Post Order of 1 would represent the first post they were shown,
and a Post Order of 4 would represent the fourth post the
participant was shown.

**Post ID:** The post identifier of the post that was shown to
the participant. It is the same ID that was specified in the
study configuration spreadsheet.

**Source ID:** The source identifier of the source that was
shown to the participant. It is the same ID that was
specified in the study configuration spreadsheet.

**Source Followers:** The followers of the source as shown
to the participant for this post.

**Source Credibility:** The credibility of the source as
shown to the participant for this post.

**Participant Credibility:** The credibility of the
participant before they reacted to this post.

**Participant Followers:** The followers of the
participant before they reacted to this post.

**Reaction:** The reaction that the participant chose
for this post. This can be one of `like`, `dislike`,
`share`, `flag`, or `skip`.

**First Time to Interact (MS):** The number of milliseconds
from when the post was first shown to the participant
for them to first select a reaction to the post. If the user
changes their reaction, this number will not change.

**Last Time to Interact (MS):** The number of milliseconds
from when the post was first shown to the participant
for them to continue to the next post.

**Credibility Change:** The change to the participant's
credibility after they reacted to this post.

**Follower Change:** The change to the participant's
followers after they reacted to this post.

## 3. Participants Sheet

**Session ID:** The session ID can be used to uniquely
one play-through of the game by a participant. This
session ID is the same session ID as used in the
**Results** sheet. The session ID will always be available,
and it is unique for every participant.

**Participant ID:** The ID that the participant entered when
starting the study, or that was filled in for them through the
URL. The participant ID is _not_ guaranteed to be unique, as
multiple participants could enter the same participant ID. It
is also not guaranteed to be present if the study has been
configured to not require identification.

**Completion Code:** The code that the participant was shown
when they completed the study.

**Game Start Time (UTC):** The time when the participant
first accessed the game and entered their ID, in the UTC
timezone.

**Game Finish Time (UTC):** The time when the participant
completed the study, before they are shown the debriefing,
in the UTC timezone.

**Study Modification Time (UTC):** The time when the
study was last updated, in the UTC timezone. When a
study is enabled or disabled, or when the contents of
a study is updated, this value will change. Therefore,
if you wish to re-run a study multiple times, this
value can be used to distinguish between the times
you ran the study if you disabled it between the
runs of the study.
