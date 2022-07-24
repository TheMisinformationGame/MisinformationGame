---
title: Firebase Pricing
showPath: true
showBackToTop: true
---

# Firebase Pricing
{:#intro .no_toc}

The Misinformation Game is hosted using Firebase as its
backend. This document analyses the pricing information
of Firebase for hosting your own studies using The
Misinformation Game.



# Table of Contents
{:#toc .no_toc}
* toc
{:toc}



## 1. Summary
{:#summary}

In summary, studies with many posts that contain images
will likely run into the free tier usage limits. Therefore,
as described in the [Reducing Image Sizes section](#reducing-image-sizes),
it is vital to reduce the size of the images you use in your
study. If you think you will come close to the usage limits,
it would be best to upgrade your Firebase project to Firebase's
**Blaze Plan** to ensure that participants don't get
locked out of the game unexpectedly. You can also set
[budget alerts](https://firebase.google.com/docs/projects/billing/avoid-surprise-bills#set-up-budget-alert-emails)
under the Blaze Plan to ensure you are never charged
more than a few dollars for hosting your instance of
The Misinformation Game.



## 2. The Structure of Firebase Pricing
{:#structure}

Firebase separates the costs for each of its backend services.
The Misinformation Game makes use of its **Hosting**,
**Cloud Firestore**, and **Cloud Storage** services. All of
these services are available under the free tier of Firebase,
which they refer to as the **Spark Plan**. Firebase also
offers a paid tier under their **Blaze Plan** for use
of their backend services beyond the free tier limits.



## 3. Firebase's Current Pricing
{:#current-pricing}

At the time of writing this document, Firebase charges
the following amounts for its backend services when
the website is hosted in Sydney. These values are likely
to change between regions, and into the future, however
they should hopefully give a good estimate.

Up-to-date pricing can be found in Firebase's own
[pricing reference](https://firebase.google.com/pricing).


### 3.1. Firebase Hosting Pricing
{:#current-pricing-hosting}

Firebase Hosting is the backend service that sends
the website to participants. This does not include sending
the images within studies.

| Hosting Action | Free Tier Limit  | Paid Tier Pricing  |
|----------------|------------------|--------------------|
| Storage        | 10 GB            | $0.026/GB          |
| Data transfer  | 360 MB/day       | $0.15/GB           |


### 3.2. Firebase Firestore Pricing
{:#current-pricing-firestore}

Firebase Firestore is the backend service that stores
the metadata about studies, and stores the results of studies.

| Cloud Storage Action  | Free Tier Limit  | Paid Tier Pricing  |
|-----------------------|------------------|--------------------|
| Stored data           | 1 GiB            | $0.115/GiB         |
| Network egress        | 10 GiB/day       | $0.12/GB           |
| Document writes       | 20K/day          | $0.115/100k        |
| Document reads        | 50K/day          | $0.038/100k        |
| Document deletes      | 20K/day          | $0.013/100k        |


### 3.3. Firebase Storage Pricing
{:#current-pricing-storage}

Firebase Storage is the backend service where the
images that are contained within studies are stored. This
service is used to send the images within studies to
participants.

| Cloud Storage Action  | Free Tier Limit  | Paid Tier Pricing  |
|-----------------------|------------------|--------------------|
| GB stored             | 5 GB             | $0.026/GB          |
| GB downloaded         | 1 GB/day         | $0.12/GB           |
| Upload operations     | 20K/day          | $0.05/10k          |
| Download operations   | 50K/day          | $0.004/10k         |



## 4. Firebase Service Usage Estimates
{:#usage-estimates}

The Misinformation Game uses quite predictable patterns
when accessing the backend services. Therefore, we can
assume the following numbers for different actions that
participants and administrators may take.

| **Action**                                | **Estimated Firebase Usage**           |
|-------------------------------------------|----------------------------------------|
| Downloading the game                      | Hosting: ~500KB download               |
| Downloading the study specification       | Firestore: 1 read                      |
| Downloading a source avatar or post image | Storage: download of size of the image |
| Uploading a participant's results         | Firestore: 1 write                     |



## 5. Fixed Costs
{:#fixed-costs}

Every study has some fixed costs per participant, which do not change
with the size of the study.

#### Firebase Hosting Costs
{:#fixed-costs-hosting .no_toc}
Each participant will have to download approximately
500KB to load the website. Under the Firebase pricing
information above, the free tier allows 360MB/day
of data to be downloaded for hosting. Therefore,
under the free tier, the study would be limited to
approximately 720 participants per day. For any
participants above this number, the **Paid Tier** of
hosting will allow an additional 13,000 participants
per $1 spent.

#### Firebase Firestore Costs
{:#fixed-costs-firestore .no_toc}
Each participant will have to download the settings of
the study once, and upload their results once. Therefore,
under the free tier, 20 thousand participants can
participate in the study per day. Therefore, this is not
likely to be a limiting factor in the number of participants
that may take part in a study.



## 6. Variable Costs
{:#variable-costs}

The content and number of sources and posts that are shown to
the participants of a study will affect the cost per participant.
This section will attempt to demonstrate this with two example studies:
one study with text posts, and one study with image posts.


### 6.1. Example Cost Estimate: Study with Text Posts
{:#variable-costs-text}

The first example study we will consider is a study with
100 text posts, and 30 sources.

#### Firebase Storage Costs
{:#variable-costs-text-storage .no_toc}
Each participant will have to download the source avatar
for each source that they are shown. If we assume each
participant is shown every source, then they would have
to download 30 images from Firebase Cloud Storage. If
we assume that these avatars are 50KB in size, then
this will require 1.5MB of data to be downloaded per
participant. Under the free tier, this will limit
the study to approximately 650 participants per day.
For any participants above this number, the **Paid
Tier** of Cloud Storage will allow an additional
5500 participants per $1 spent.


### 6.2. Example Cost Estimate: Study with Image Posts
{:#variable-costs-images}

The second example study we will consider is a study
with 100 image posts, and 30 sources.

#### Firebase Storage Costs
{:#variable-costs-images-storage .no_toc}
Each participant will have to download the source avatar
for each source they are shown, as well as the image
for every post that they are shown. If we assume again
that each participant is shown every source and post,
then they will have to download 30 source avatars and
100 post images from Firebase Cloud Storage. If we
assume that the source avatars are 50KB in size, and
the post images are 200KB in size, then this will
require 21.5MB of data to be downloaded per participant.
Under the free tier, this will limit the study to
approximately 45 participants per day. For any
participants above this number, the **Paid Tier** of
Cloud Storage will allow an additional 380 participants
per $1 spent.



## 7. Reducing Image Sizes
{:#reducing-image-sizes}

From the analysis above, it becomes clear that most of
the cost of hosting studies using The Misinformation
Game on Firebase is due to participants having to
download images. Therefore, when possible reducing the
sizes of images is vital to reduce the Firebase costs,
and to stay within the free tier.

Reducing the size of images can be down by scaling down
the images, and exporting them using the JPEG file format.
The images in [Figure 1](#fig1) and [Figure 2](#fig2)
will be displayed very similarly to participants, however
they have very different file sizes.

**Original Image:**
<figure id="fig1">
    <img src="diagrams/example-image-1600x1000.jpg" alt="figure 1" height="1000" />
    <figcaption>
        <a href="#fig1">Figure 1.</a> Photo with a resolution of 1600x1000, and a file size of 295KB.
    </figcaption>
</figure>


**Scaled-Down and Compressed Image:**
<figure id="fig2">
    <img src="diagrams/example-image-800x500-compressed.jpg" alt="figure 2" height="500" />
    <figcaption>
        <a href="#fig2">Figure 2.</a> Compressed photo with a resolution of 800x500, and a file size of 74KB.
    </figcaption>
</figure>

As you can see above, the quality of both images appears
to be similar, despite the fact that the second image is
only 25% of the size of the first. Therefore, to reduce the
file size and increase the number of participants that can
be supported under the free tier, down-scaling your post
images will be very important. More information about
downscaling and compressing your images can be found in
the [Including Images in Studies](/Images) documentation.
