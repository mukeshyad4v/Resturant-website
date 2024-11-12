
const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs-extra');
const path = require('path');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(express.json());
app.use(express.static('public'));

const supportedFormats = ['jpeg', 'png', 'gif', 'svg'];

app.post('/upload', upload.single('image'), async (req, res) => {
    const { width, height, format, watermarkText } = req.body;
    const imageId = uuidv4();
    const extension = format || 'jpeg';
    const outputDir = 'resized';
    const outputPath = path.join(outputDir, `${imageId}.${extension}`);

    console.log('File uploaded to:', req.file?.path);  // Debugging log

    // Ensure directories exist
    await fs.ensureDir(outputDir);

    if (!supportedFormats.includes(extension)) {
        return res.status(400).json({ error: 'Unsupported format' });
    }

    try {
        let image = sharp(req.file.path);
        const metaData = await image.metadata();
        console.log('Image metadata:', metaData);  // Debugging log

        const resizeOptions = {};
        if (width) resizeOptions.width = parseInt(width);
        if (height) resizeOptions.height = parseInt(height);

        image = image.resize(resizeOptions);

        // Watermark (optional)
        if (watermarkText) {
            console.log('Adding watermark');  // Debugging log
            image = image.composite([
                {
                    input: Buffer.from(`<svg><text x="10" y="50" font-size="30">${watermarkText}</text></svg>`),
                    gravity: 'southeast'
                }
            ]);
        }

        // Convert format if specified
        if (format) {
            console.log(`Converting image to ${format}`);  // Debugging log
            image = image.toFormat(format);
        }

        await image.toFile(outputPath);
        await fs.remove(req.file.path);
        console.log('Image saved to:', outputPath);  // Debugging log

        res.json({ imageId, url: `/download/${imageId}.${extension}` });
    } catch (err) {
        console.error('Error processing image:', err);  // Logs detailed error
        res.status(500).json({ error: 'Error processing image', details: err.message });
    }
});

app.get('/download/:imageId', (req, res) => {
    const imagePath = path.join('resized', req.params.imageId);
    res.sendFile(path.resolve(imagePath));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
