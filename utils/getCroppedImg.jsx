//  export const applyCropZoomRotation = async (imageSrc, pixelCrop, rotation = 0) => {
//     const image = await createImage(imageSrc);
//     const canvas = document.createElement('canvas');
//     const ctx = canvas.getContext('2d');

//     const maxSize = Math.max(image.width, image.height);
//     const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2));

//     // set dimensions to double largest dimension to allow for rotation
//     canvas.width = safeArea;
//     canvas.height = safeArea;

//     // translate canvas center to image center
//     ctx.translate(safeArea / 2, safeArea / 2);
//     ctx.rotate((rotation * Math.PI) / 180);
//     ctx.translate(-safeArea / 2, -safeArea / 2);

//     // draw image in center of canvas
//     ctx.drawImage(
//         image,
//         safeArea / 2 - image.width * 0.5,
//         safeArea / 2 - image.height * 0.5
//     );

//     // extract cropped image
//     const data = ctx.getImageData(
//         safeArea / 2 - (pixelCrop.width / 2),
//         safeArea / 2 - (pixelCrop.height / 2),
//         pixelCrop.width,
//         pixelCrop.height
//     );

//     // set canvas width to final desired crop size
//     canvas.width = pixelCrop.width;
//     canvas.height = pixelCrop.height;

//     // place image data in the new canvas
//     ctx.putImageData(data, 0, 0);

//     return new Promise((resolve) => {
//         canvas.toBlob((blob) => {
//             resolve(URL.createObjectURL(blob));
//         }, 'image/jpeg');
//     });
// };
export const applyCropZoomRotation = (image, crop, zoom, rotation) => {
    return new Promise((resolve, reject) => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        const img = new Image();
        img.src = image;

        img.onload = () => {
            // Set canvas size to maintain original dimensions
            canvas.width = img.width;
            canvas.height = img.height;

            // Clear the canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Move to center and apply rotation
            ctx.translate(canvas.width / 2, canvas.height / 2);
            ctx.rotate((rotation * Math.PI) / 180);

            // Apply zoom from the center
            ctx.scale(zoom, zoom);

            // Move back
            ctx.translate(-canvas.width / 2, -canvas.height / 2);

            // Draw the image
            ctx.drawImage(
                img,
                0,
                0,
                img.width,
                img.height
            );

            // Reset transformation
            ctx.setTransform(1, 0, 0, 1, 0, 0);

            resolve(canvas.toDataURL());
        };

        img.onerror = (error) => {
            reject(error);
        };
    });
};  