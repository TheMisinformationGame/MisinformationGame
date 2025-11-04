---
title: Results
showPath: true
underDocsPath: true
showBackToTop: true
---

# The Results Spreadsheet
{:#intro}

The results for studies can be downloaded from the Admin
Dashboard, by selecting the study, and then selecting
**Download Results**. The results are downloaded as a
.xlsx file that may be opened in any spreadsheet program
such as Google Sheets or Microsoft Excel. The results
spreadsheet is split into four worksheets:

1) **[The Overview Worksheet](#overview):**
   This sheet contains information about the study the
   results are from, the number of participants, and when the
   results were downloaded.

2) **[The Posts Worksheet](#posts):**
   This sheet contains all the interactions participants made with
   the posts that they were shown, as well as information about
   those posts.

3) **[The Comments Worksheet](#comments) _(optional)_:**
   This sheet contains the reactions of participants to comments
   on posts. If your study contains no comments, this sheet
   will not be included.

4) **[The Participants Worksheet](#participants):**
   This sheet contains a list of all the participants in the
   study, when they completed the study, and their completion
   codes.



## Table of Contents
{:#toc .no_toc}
* toc
{:toc}


## Example Results
{:#example-results}

If you wish to view some example results from a user experience
study ran using The Misinformation Game, they can be accessed
from [the example results page](/link/ExampleResults).



## 1. Overview Worksheet
{:#overview}

This sheet contains information about the study that the results
are from, the number of participants, and when the results were
downloaded.

#### Study ID
{:#overview-study-id .no_toc}
The identification number used in the URL of
the study to identify it. It is unique for each study.

#### Study Name
{:#overview-study-name .no_toc}
The name that was configured in the configuration spreadsheet
for the study.

#### Participants
{:#overview-participants .no_toc}
The number of participants that completed the study.

#### Results Download Time (UTC)
{:#overview-download-time .no_toc}
The date and time that the results were downloaded, in UTC time.



## 2. Posts Worksheet
{:#posts}

This sheet contains all the interactions of participants with
the posts that they were shown, as well as information about
those posts.

#### Session ID
{:#posts-session-id .no_toc}
The session ID can be used to uniquely identify a participant
in their play-through of the game. The session ID is always
available, and it is unique for every participant.

#### Participant ID
{:#posts-participant-id .no_toc}
The ID that the participant entered when starting the study,
or that was filled in for them through the URL. The participant
ID is _not_ guaranteed to be unique, as multiple participants
could enter the same participant ID. It is also not guaranteed
to be present if the study has been configured to not require
identification.

#### Post Order
{:#posts-post-order .no_toc}
A number starting from 1 that represents when the participant
was shown the post associated with this row of the results.
For example, a Post Order of 1 would represent the first post
shown to a participant, and a Post Order of 4 would represent
the fourth post the participant was shown.

#### Post ID
{:#posts-post-id .no_toc}
The [Post ID](/StudyConfiguration#posts-post-id) of the post
that was shown to the participant. This is the same ID that
was specified in the configuration spreadsheet for the post.

#### Source ID
{:#posts-source-id .no_toc}
The [Source ID](/StudyConfiguration#sources-id) of the source
that was associated with a post that was shown to the
participant. This is the same ID that was specified in the
configuration spreadsheet for the source.

#### Source Credibility
{:#posts-source-credibility .no_toc}
The credibility of the source that was associated with
a post shown to the participant.

#### Source Followers
{:#posts-source-followers .no_toc}
The number of followers of the source that was associated with
a post shown to the participant.

#### Post Headline
{:#posts-headline .no_toc}
The [Headline](/StudyConfiguration#posts-headline) of the post
shown to the participant. This is the same headline
that was specified in the configuration spreadsheet for the
post. This will be empty if the post did not have a headline.

#### Post Likes
{:#posts-post-likes .no_toc}
The number of like reactions to the post shown to
the participant. This does not include the increase to the
number of likes if the participant liked this post. This
column will only be included if
[Post Likes are Enabled](/StudyConfiguration#general-post-likes-enabled).

#### Post Dislikes
{:#posts-post-dislikes .no_toc}
The number of dislike reactions to the post shown
to the participant. This does not include the increase to the
number of dislikes if the participant disliked this post. This
column will only be included if
[Post Dislikes are Enabled](/StudyConfiguration#general-post-dislikes-enabled).

#### Post Shares
{:#posts-post-shares .no_toc}
The number of share reactions to the post shown
to the participant. This does not include the increase to the
number of shares if the participant shared this post. This
column will only be included if
[Post Shares are Enabled](/StudyConfiguration#general-post-shares-enabled).

#### Post Flags
{:#posts-post-flags .no_toc}
The number of flag reactions to the post shown
to the participant. This does not include the increase to the
number of flags if the participant flagged this post. This
column will only be included if
[Post Flags are Enabled](/StudyConfiguration#general-post-flags-enabled).

#### Liked Post
{:#posts-liked-post .no_toc}
Whether the participant liked the post. This column
will only be included if
[Post Likes are Enabled](/StudyConfiguration#general-post-likes-enabled).

#### Disliked Post
{:#posts-disliked-post .no_toc}
Whether the participant disliked the post. This column
will only be included if
[Post Dislikes are Enabled](/StudyConfiguration#general-post-dislikes-enabled).

#### Shared Post
{:#posts-shared-post .no_toc}
Whether the participant shared the post. This column
will only be included if
[Post Shares are Enabled](/StudyConfiguration#general-post-shares-enabled).

#### Flagged Post
{:#posts-flagged-post .no_toc}
Whether the participant flagged the post. This column
will only be included if
[Post Flags are Enabled](/StudyConfiguration#general-post-flags-enabled).

#### Skipped Post
{:#posts-skipped-post .no_toc}
Whether the participant explicitly chose the skip post
reaction. If reactions are not required, or if the study
is using the feed mode, then participants may move past
a post without interacting with it. In those cases, this
value will be `FALSE`, as they did not select the skip
post reaction.

#### User Comment
{:#posts-skipped-post .no_toc}
The comment that the participant made on a post. If the
participant did not comment on the post, then this cell
will be empty. This column will only be included if
[Require Comments](/StudyConfiguration#general-require-comments)
is set to `Required` or `Optional`.

#### Dwell Time (MS)
{:#posts-dwell-time .no_toc}
The amount of time that this post was accessible by the
participant, in milliseconds. If in feed mode, then this
metric may count time in which the post was off of the
screen. This value will always be available.

#### First Time to Interact (MS)
{:#posts-first-time-to-interact .no_toc}
The time from the post becoming visible to the
participant's first interaction with the post, in
milliseconds. Interactions include comments on posts,
or reactions to posts. Once a participant has made
their first interaction with a post, this value
will no longer change. If the participant had
no interactions with a post, then this cell will
be empty.

#### Last Time to Interact (MS)
{:#posts-last-time-to-interact .no_toc}
The time from the post becoming visible to the
participant's last interaction with the post, in
milliseconds. Interactions include comments on posts,
or reactions to posts. If the participant had no
interactions with a post, then this cell will be
empty.

#### Credibility Change
{:#posts-credibility-change .no_toc}
The change to the participant's credibility after
they interacted with the post.

#### Follower Change
{:#posts-follower-change .no_toc}
The change to the participant's number of followers
after they interacted with the post.

#### Credibility Before
{:#posts-credibility-before .no_toc}
The credibility of the participant before they
interacted with the post.

#### Followers Before
{:#posts-followers-before .no_toc}
The number of followers of the participant before
they interacted with the post.

#### Credibility After
{:#posts-credibility-before .no_toc}
The credibility of the participant after they
interacted with the post.

#### Followers After
{:#posts-followers-before .no_toc}
The number of followers of the participant after
they interacted with the post.



## 3. Comments Worksheet
{:#comments}

This sheet contains the reactions of participants to comments
on posts. If your study contains no comments, then this sheet
will not be included.

#### Session ID
{:#comments-session-id .no_toc}
The session ID can be used to uniquely identify a participant
in their play-through of the game. The session ID is always
available, and it is unique for every participant. This is
the same [Session ID](#posts-session-id) that is stored in the
Posts Worksheet.

#### Participant ID
{:#comments-participant-id .no_toc}
The ID that the participant entered when starting the study,
or that was filled in for them through the URL. The participant
ID is _not_ guaranteed to be unique, as multiple participants
could enter the same participant ID. It is also not guaranteed
to be present if the study has been configured to not require
identification. This is the same
[Participant ID](#posts-participant-id) that is stored in the
Posts Worksheet.

#### Post Order
{:#comments-post-order .no_toc}
A number starting from 1 that represents when the participant
was shown the post associated with this row of the results.
For example, a Post Order of 1 would represent the first post
shown to a participant, and a Post Order of 4 would represent
the fourth post the participant was shown. This is the same
[Post Order](#posts-post-order) that is stored in the
Posts Worksheet.

#### Post ID
{:#comments-post-id .no_toc}
The [Post ID](/StudyConfiguration#posts-post-id) of the post
that was shown to the participant. This is the same ID that
was specified in the configuration spreadsheet for the post.

#### Comment Order
{:#comments-comment-order .no_toc}
A number starting from 1 that identifies the order in which
the comments were displayed beneath a post. For example, a
value of 1 would represent the first comment below a post,
and a value of 3 would represent the third comment below
a post.

#### Comment Text
{:#comments-comment-text .no_toc}
The text contents of the comment that was displayed to
the participant.

#### Comment Likes
{:#comments-comment-likes .no_toc}
The number of like reactions that was associated with the
comment. This does not include the increase to the number
of likes if the participant liked this comment. This
column will only be included if
[Comment Likes are Enabled](/StudyConfiguration#general-comment-likes-enabled).

#### Comment Dislikes
{:#comments-comment-dislikes .no_toc}
The number of dislike reactions that was associated with the
comment. This does not include the increase to the number
of dislikes if the participant disliked this comment. This
column will only be included if
[Comment Dislikes are Enabled](/StudyConfiguration#general-comment-dislikes-enabled).

#### Liked Comment
{:#comments-liked-comment .no_toc}
Whether the participant liked this comment. This column
will only be included if
[Comment Likes are Enabled](/StudyConfiguration#general-comment-likes-enabled).

#### Disliked Comment
{:#comments-disliked-comment .no_toc}
Whether the participant disliked this comment. This column
will only be included if
[Comment Dislikes are Enabled](/StudyConfiguration#general-comment-dislikes-enabled).

#### First Time to Interact (MS)
{:#comments-first-time-to-interact .no_toc}
The time from the post becoming visible to the
participant's first reaction to this comment, in
milliseconds. Once a participant has made their
first reaction to a comment, this value will no
longer change. If the participant did not react
to the comment, then this cell will be empty.

#### Last Time to Interact (MS)
{:#comments-last-time-to-interact .no_toc}
The time from the post becoming visible to the
participant's last reaction to this comment, in
milliseconds. If the participant did not react
to the comment, then this cell will be empty.



## 4. Participants Worksheet
{:#participants}

This sheet contains a list of all the participants in the
study, when they completed the study, and their completion
codes.

#### Session ID
{:#participants-session-id .no_toc}
The session ID can be used to uniquely identify a participant
in their play-through of the game. The session ID is always
available, and it is unique for every participant. This is
the same [Session ID](#posts-session-id) that is stored in the
Posts Worksheet.

#### Participant ID
{:#participants-participant-id .no_toc}
The ID that the participant entered when starting the study,
or that was filled in for them through the URL. The participant
ID is _not_ guaranteed to be unique, as multiple participants
could enter the same participant ID. It is also not guaranteed
to be present if the study has been configured to not require
identification. This is the same
[Participant ID](#posts-participant-id) that is stored in the
Posts Worksheet.

#### Completion Code
{:#participants-completion-code .no_toc}
The code that the participant was shown when they completed
the study.

#### Game Start Time (UTC)
{:#participants-game-start-time .no_toc}
The time when the participant first accessed the game and
entered their ID, in UTC time.

#### Game Finish Time (UTC)
{:#participants-game-finish-time .no_toc}
The time when the participant completed the study
(before being shown the debriefing), in UTC time.

#### Study Modification Time (UTC)
{:#participants-study-modification-time .no_toc}
The time when the study was last updated, in UTC time.
When a study is enabled or disabled, or when the contents
of a study are updated, this value will change. Therefore,
if a study is re-run multiple times, and disabled in-between,
this value can be used to differentiate runs.
