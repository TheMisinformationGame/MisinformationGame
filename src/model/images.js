import {doTypeCheck} from "../utils/types";
import {coerceBufferToUint8Array} from "../utils/excel";


/**
 * Represents the metadata required to read a StudyImage from storage.
 */
export class StudyImageMetadata {
    type; // String

    constructor(type) {
        doTypeCheck(type, "string", "Image Type");
        this.type = type;
    }

    toMetadata() {
        return this;
    }

    toJSON() {
        return {
            type: this.type
        };
    }

    static fromJSON(json) {
        if (!json || !json["type"])
            return new StudyImageMetadata("jpg");
        return new StudyImageMetadata(json["type"]);
    }
}

/**
 * Represents an image such as a post or an avatar.
 */
export class StudyImage {
    buffer; // Uint8Array
    type; // String

    constructor(buffer, type) {
        doTypeCheck(buffer, Uint8Array, "Image Contents");
        doTypeCheck(type, "string", "Image Type");
        this.buffer = buffer;
        this.type = type;
    }

    /**
     * Returns the metadata required to load this image.
     */
    toMetadata() {
        return new StudyImageMetadata(this.type);
    }

    /**
     * Returns the URL that should be used to populate the image.
     */
    createImageSrc() {
        return URL.createObjectURL(
            new Blob([this.buffer.buffer], { type: "image/" + this.type })
        );
    }

    /**
     * Returns the path to this image in storage.
     */
    static getPath(study, imageID, imageMetadata) {
        return "/Admins/" + study.authorID + "/Studies/" + study.id + "/" + imageID + "." + imageMetadata.type;
    }

    /**
     * Returns a Promise to a StudyImage from the given excel image.
     */
    static fromExcelImage(excelImage) {
        return Promise.resolve(new StudyImage(
            coerceBufferToUint8Array(excelImage.buffer), excelImage.extension
        ));
    }
}
