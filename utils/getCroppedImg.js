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