import * as tf from '@tensorflow/tfjs-node';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import fs from 'fs';

const marketplace_objects = []
export async function analyzeImage(imagePath: string): Promise<{
    approved: boolean;
    message: string;
    detectedObjects: string[];
}> {
    try {
        // Load the Coco SSD model
        const model = await cocoSsd.load();

        // Read and decode the image
        const imageBuffer = fs.readFileSync(imagePath);
        let imageTensor = tf.node.decodeImage(imageBuffer) as tf.Tensor3D;

        // Ensure the tensor has 3 channels (RGB)
        if (imageTensor.shape[2] === 4) {
            // Remove the alpha channel (slice to keep only RGB)
            imageTensor = tf.slice(imageTensor, [0, 0, 0], [-1, -1, 3]) as tf.Tensor3D;
        } else if (imageTensor.shape[2] !== 3) {
            throw new Error(`Unexpected number of channels: ${imageTensor.shape[2]}. Expected 3 (RGB).`);
        }

        // Perform object detection
        const predictions = await model.detect(imageTensor);

        // Clean up tensor
        tf.dispose(imageTensor);

        // Check if the specified object is detected with confidence >= 0.5
        const matchedPrediction = predictions.find(
            p => marketplace_objects.map(obj => obj.toLowerCase()).includes(p.class.toLowerCase()) && p.score >= 0.5
        );
        const isApproved = Boolean(matchedPrediction);
        const objectName = matchedPrediction ? matchedPrediction.class : 'specified object';
        const detectedObjects = predictions.map(p => `${p.class} (${(p.score * 100).toFixed(2)}%)`);

        // Delete the uploaded image file
        fs.unlinkSync(imagePath);

        return {
            approved: isApproved,
            message: isApproved
                ? `Image approved: contains ${objectName}`
                : `Image rejected: does not contain ${objectName}`,
            detectedObjects
        };
    } catch (error) {
        // Delete the image file even on error to avoid accumulation
        if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
        }
        if (error instanceof Error) {
            throw new Error(`Error analyzing image: ${error.message}`);
        } else {
            throw new Error(`Error analyzing image: ${String(error)}`);
        }
    }
}