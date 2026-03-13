const Tesseract = require('tesseract.js');
const path = require('path');
const fs = require('fs');

async function testOCR() {
    console.log("Starting Tesseract test...");
    try {
        const worker = await Tesseract.createWorker('eng+hin');
        console.log("Worker created with eng+hin.");
        // Create a dummy image or use an existing one if possible
        // Let's just try to initialize it.
        await worker.terminate();
        console.log("Tesseract test PASSED.");
    } catch (err) {
        console.error("Tesseract test FAILED:", err);
    }
}

testOCR();
