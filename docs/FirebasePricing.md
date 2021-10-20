# Firebase Pricing
This application is hosted using firebase. This document
analyses the pricing of Firebase for hosting this
application in particular. More information regarding
this in general can be found in Firebase's own
[pricing reference](https://firebase.google.com/pricing).

## 1. How the pricing works
Firebase separates the costs for each of its backend services.
The Misinformation Game makes use of its **Hosting**,
**Cloud Firestore**, and **Cloud Storage** services. All of
these services are available under the free tier of Firebase,
which they refer to as the **Spark Plan**. Firebase also
offers a **Blaze Plan** for any use of their backend
services above their free tier limits.

## 2. Firebase's Current Pricing
At the time of writing this document, Firebase charges
the following amounts for its backend services when
the website is hosted in Sydney. These values are likely
to change between regions, and into the future, however
they should hopefully give a good estimate for now.

### 2.1. Firebase Hosting
Firebase Hosting is the backend service that sends
the website to participants. This does not include sending
the images within studies.

|  Hosting Action  |  Free Tier Limit  |  Paid Tier Pricing  |
| -------- | ----------------- | ------------------- |
|  Storage  |  10 GB  |  $0.026/GB  |
|  Data transfer  |  360 MB/day  |  $0.15/GB  |

### 2.2. Firebase Cloud Firestore
Firebase Cloud Firestore is the backend service that stores
the metadata about studies, and stores the results of studies.

|  Cloud Storage Action  |  Free Tier Limit  |  Paid Tier Pricing  |
| -------- | ----------------- | ------------------- |
|  Stored data  |  1 GiB  |  $0.115/GiB  |
|  Network egress  |  10 GiB/day  |  $0.12/GB  |
|  Document writes  |  20K/day  |  $0.115/100k  |
|  Document reads  |  50K/day  |  $0.038/100k  |
|  Document deletes  |  20K/day  |  $0.013/100k  |

### 2.3. Firebase Cloud Storage
Firebase Cloud Storage is the backend service where the
images that are contained within studies are stored. This
service is used to send the images within studies to
participants.

|  Cloud Storage Action  |  Free Tier Limit  |  Paid Tier Pricing  |
| -------- | ----------------- | ------------------- |
|  GB stored  |  5 GB  |  $0.026/GB  |
|  GB downloaded  |  1 GB/day  |  $0.12/GB  |
|  Upload operations  |  20K/day  |  $0.05/10k  |
|  Download operations  |  50K/day  |  $0.004/10k  |

## 3. Pricing Estimates for an Example Study
We can make pricing estimates for running a study by
considering two different example studies. Each example
study will contain 100 posts and 30 sources. We will
assume that the size of the avatar images of each source
is 50KB.

### 3.1. Usage Estimates of The Misinformation Game
The Misinformation Game uses quite predictable patterns
when accessing the backend services. Therefore, we can
assume the following numbers for different actions that
participants and administrators may take.

#### Opening the game
Opening the game requires participants to download the
contents of the website. This requires approximately
500KB of data to be transferred.

#### Downloading the details of the study
Once the game has been opened, it must download the
settings of the study. This requires 1 Firestore
Database read.

#### Downloading a source avatar or post image
Downloading an image requires the image to be
downloaded from Firebase Cloud Storage. The
amount of data that has to be downloaded will
depend upon the size of the source avatar images
and the post images.

#### Uploading a participant's results
Once a participant has completed the study, it
will require one Firestore Database write to
store their results.

### 3.2. Costs for every study
Every study has some shared costs that do not change
with the size of the study.

#### Firebase Hosting
Each participant will have to download approximately
500KB to load the website. Under the Firebase pricing
information above, the **Free Tier** allows 360MB/day
of data to be downloaded for hosting. Therefore,
under the free tier, the study would be limited to
approximately 720 participants per day. For any
participants above this number, the **Paid Tier** of
hosting will allow an additional 13,000 participants
per $1 spent.

#### Firebase Cloud Firestore
Each participant will have to download the settings of
the study once, and upload their results once. Therefore,
under the **Free Tier**, 20 thousand participants can
participate in the study per day. This is therefore not
likely to be an issue.

### 3.3. A study with text posts
The first example study we will consider is a study with
only text posts, and with 30 sources and 100 posts.

#### Firebase Cloud Storage
Each participant will have to download the source avatar
for each source that they are shown. If we assume each
participant is shown every source, then they would have
to download 30 images from Firebase Cloud Storage. If
we assume that these avatars are 50KB in size, then
this will require 1.5MB of data to be downloaded per
participant. Under the **Free Tier**, this will limit
the study to approximately 650 participants per day.
For any participants above this number, the **Paid
Tier** of Cloud Storage will allow an additional
5500 participants per $1 spent.

### 3.4. A study with image posts
The second example study we will consider is a study
with 100 image posts, and 30 sources.

#### Firebase Cloud Storage
Each participant will have to download the source avatar
for each source they are shown, as well as the image
for every post that they are shown. If we assume again
that each participant is shown every source and post,
then they will have to download 30 source avatars and
100 post images from Firebase Cloud Storage. If we
assume that the source avatars are 50KB in size, and
the post images are 200KB in size, then this will
require 21.5MB of data to be downloaded per participant.
Under the **Free Tier**, this will limit the study to
approximately 45 participants per day. For any
participants above this number, the **Paid Tier** of
Cloud Storage will allow an additional 380 participants
per $1 spent.

## 4. A note about images in a study
From the analysis above, it becomes clear that most of
the cost of hosting studies using The Misinformation
Game on Firebase is due to participants having to
download images. Therefore, when possible reducing the
sizes of images is vital to reduce the Firebase costs,
and to stay within the **Free Tier**.

Reducing the size of images can be down by scaling down
the images, and exporting them using the JPG file format.
The two following images will be displayed very similarly
to participants, however they have very different sizes.

**Original Image, 1600x1000, 295KB:**
<img src="diagrams/example-image-1600x1000.jpg" alt="Example image that is 1600 x 1000" width="600" />

**Scaled-Down Image, 800x500, 88KB:**
<img src="diagrams/example-image-800x500.jpg" alt="Example image that is 800 x 500" width="600" />

As you can see above, the quality of both images appears
to be similar, despite the fact that the second image is
only 29% of the size. Therefore, to reduce the file size
and increase the number of participants that can be
supported under the free tier, down-scaling your post
images will be very important. The online tool
[Simple Image Resizer](http://www.simpleimageresizer.com/)
can be used to perform this down-scaling for you. When
down-scaling using this service, it is best to select
the **dimensions** option for _Define the new size of
your image_, and to enter a new width of 800.

Additionally, after down-scaling your post images, you can
also run the images through a compression service such as
[CompressJpeg.com](https://compressjpeg.com/) to reduce
their size even further. The image below is even further
compressed to 74KB.

**Scaled-Down and Compressed Image, 800x500, 74KB:**
<img src="diagrams/example-image-800x500-compressed.jpg" alt="Example image that is 800 x 500" width="600" />

