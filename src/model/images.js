import {doTypeCheck} from "../utils/types";
import {base64ToBytes, bytesToBase64} from "../utils/base64";


/**
 * We limit the size of images to 500 KiB to stay
 * within the Firestore 1 MiB object limit after
 * conversion to base 64.
 */
export const FIRESTORE_IMAGE_LIMIT = {
    bytes: 500 * 1024,
    text: "500 KiB"
};

/**
 * Creates a canvas element to draw into.
 * Taken from https://github.com/Sothatsit/RoyalUrClient.
 */
function renderResource(width, height, renderFunction) {
    if (isNaN(width) || isNaN(height))
        throw new Error("Width and height cannot be NaN, was given " + width + " x " + height);
    if (width < 1 || height < 1)
        throw new Error("Width and height must both be at least 1, was given " + width + " x " + height);

    const canvas = document.createElement("canvas"),
          ctx = canvas.getContext("2d");

    canvas.width = width;
    canvas.height = height;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    renderFunction(ctx, canvas);
    return canvas;
}

/**
 * Halves the dimension of {@param image} by drawing a
 * scaled down version of it into a Canvas element.
 */
function halveImageSize(image) {
    const scaledWidth = Math.round(image.width / 2);
    const scaledHeight = Math.round(image.height / 2);
    return renderResource(scaledWidth, scaledHeight, (ctx) => {
        ctx.drawImage(image, 0, 0, scaledWidth, scaledHeight);
    });
}

/**
 * Represents an image such as a post or an avatar.
 */
export class StudyImage {
    buffer; // Uint8Array
    type; // String

    constructor(buffer, type) {
        doTypeCheck(buffer, Uint8Array);
        doTypeCheck(type, "string");
        this.buffer = buffer;
        this.type = type;
    }

    getBytes() {
        return this.buffer.length;
    }

    /**
     * This will scale down this image until it fits within the
     * Firestore image limit defined in FIRESTORE_IMAGE_LIMIT.
     */
    async scaleDown() {
        return new Promise((resolve, reject) => {
            // If this image is within the limit, fulfill the callback.
            if (this.getBytes() < FIRESTORE_IMAGE_LIMIT.bytes) {
                resolve(this);
                return;
            }

            // Otherwise halve the size of the image and try again.
            try {
                this.createImage().then((image) => {
                    const scaled = halveImageSize(image);
                    scaled.toBlob((blob) => {
                        blob.arrayBuffer().then((arrayBuffer) => {
                            try {
                                const newBuffer = new Uint8Array(arrayBuffer);
                                const newImage = new StudyImage(newBuffer, blob.type);
                                newImage.scaleDown().then(resolve, reject);
                            } catch (error) {
                                reject(error);
                            }
                        }).catch(reject);
                    }, this.type, 0.9);
                }).catch(reject);
            } catch (error) {
                reject(error);
            }
        });
    }

    createImage() {
        return new Promise((resolve, reject) => {
            const image = new Image();
            image.src = URL.createObjectURL(
                new Blob([this.buffer.buffer], { type: this.type })
            );
            image.onload = () => resolve(image);
            image.onerror = () => reject(new Error("Image could not be created from Blob"));
            return image;
        });
    }

    toJSON() {
        return {
            "type": this.type,
            "buffer": bytesToBase64(this.buffer)
        };
    }

    /**
     * Returns a Promise to a StudyImage from the given excel image.
     */
    static fromExcelImage(excelImage) {
        return new StudyImage(excelImage.buffer, "image/" + excelImage.extension).scaleDown();
    }

    static fromJSON(json) {
        return new StudyImage(base64ToBytes(json["buffer"]), json["type"]);
    }
}
