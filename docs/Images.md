---
title: Including Images in Studies
showPath: true
---

# Recommendations for including images in studies
The transfer of images from Firebase to your participants can
incur a large cost due to the bandwidth required. Therefore,
reducing the size of the images in your study can reduce the
cost of running the study, and increase the participants
that can be served under the free tier of Firebase.

## 1. Choice of image file formats
<span class="recommendation">Recommendation</span>
Use JPEG (`.jpg`) image files where possible.

There are modern image file formats that allow better compression
of images. However, older and cheaper computers, tablets, and
phones may not support them. Therefore, it is recommended that
you use either the PNG (`.png`) or JPEG (`.jpg`) file formats for
images. These file formats are very widely supported.

Additionally, JPEG files can be compressed further than PNG files,
and therefore JPEG images will often be smaller. Therefore, the use
of JPEG images is recommended. However, sometimes JPEG files can
introduce visual artifacts to some images. If you observe this, then
using PNG files instead will avoid those at the cost of additional
file size.

### Animated Images
If you wish to include animated images in your study, you may use the
GIF (`.gif`) image file format. However, these images can be very large,
and The Misinformation Game does not support more efficient video formats.


## 2. Scale-down images
<span class="recommendation">Recommendation</span>
Downscale your images to the dimensions recommended in the
[Study Configuration](/StudyConfiguration) documentation using a tool
such as [https://www.iloveimg.com/resize-image](https://www.iloveimg.com/resize-image#resize-options,pixels).

The easiest way to reduce the size of images is to downscale them to
smaller dimensions. This reduces the number of pixels that must be stored
for the image, which reduces their file size. However, if images are
downscaled too far, then they will look pixelated. The
[Study Configuration](/StudyConfiguration) documentation contains
recommendations for the dimensions to downscale avatar and post images
to. You can then use the tool
[https://www.iloveimg.com/resize-image](https://www.iloveimg.com/resize-image#resize-options,pixels)
to resize your study images to the recommended sizes before adding
them to your study configuration spreadsheet.

**Original Image, 1600x1000, 295KB:**
<img src="diagrams/example-image-1600x1000.jpg" alt="Example image that is 1600 x 1000" width="600" />

**Scaled-Down Image, 800x500, 88KB:**
<img src="diagrams/example-image-800x500.jpg" alt="Example image that is 800 x 500" width="600" />


## 3. Compress your images
<span class="recommendation">Recommendation</span>
Use a tool such as [https://imagecompressor.com/](https://imagecompressor.com/)
to compress your images.

Images can also be compressed without reducing their dimensions by reducing
their quality. This compression can be done by automated tools such as
[https://imagecompressor.com/](https://imagecompressor.com/). The output
of these tools is often imperceptibly different from the original image,
especially when the image is a photo. However, it is recommended that
you compare the image to the original after compression to make sure it
hasn't lost too much quality.

**Scaled-Down Image, 800x500, 88KB:**
<img src="diagrams/example-image-800x500.jpg" alt="Example image that is 800 x 500" width="600" />

**Scaled-Down and Compressed Image, 800x500, 74KB:**
<img src="diagrams/example-image-800x500-compressed.jpg" alt="Example image that is 800 x 500 and compressed" width="600" />


## 4. Insert the images into your study configuration
Images must be inserted into the configuration spreadsheet using the **Insert**
menu at the top of the page in Google Sheets. You must first select the cell
where you want to insert the image, and then select **Insert** -> **Image**
-> **Image in cell**. If you do not use this procedure, then The Misinformation
Game may not be able to find the image.

<img src="diagrams/inserting-image.png" alt="How to insert an image" height="275"/>
