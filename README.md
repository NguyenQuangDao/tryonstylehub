# FASHN AI Virtual Try-On Next.js App

![FASHN AI Try-On App](https://cilsrdpvqtgutxprdofn.supabase.co/storage/v1/object/public/assets/logo-enhanced_60x60.png)

This repository is a Next.js application for the FASHN Virtual Try-On API, allowing users to upload model and garment images to see virtual try-on results.

## [Live demo 🔗](https://tryon-nextjs-app.vercel.app/)

![FASHN AI Next App preview](/public/preview.png)

### Sign Up to FASHN
This repository requires an API key from a FASHN account.

Don't have an account yet? [Create an account](https://app.fashn.ai/?utm_source=nextjs-tryon-app&utm_medium=readme&utm_campaign=signup)

If you already have an account, go to Settings → API → `+ Create new API key`

## Getting Started

### Prerequisites

- Node.js (v18+)
- npm or yarn
- FASHN API key (get one from [fashn.ai](https://fashn.ai/?utm_source=nextjs-tryon-app&utm_medium=readme&utm_campaign=api-key))

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/fashn-AI/tryon-nextjs-app
   cd tryon-nextjs-app
   ```

2. Install dependencies
   ```bash
   npm install
   # or
   yarn
   ```

3. Create a `.env.local` file in the root directory with your FASHN API key:
   ```
   FASHN_API_KEY=your-api-key-here
   ```

4. Start the development server
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. Upload a model image (a photo of a person)
2. Upload a garment image (a clothing item)
3. Configure the parameters:
   - Garment photo type (Auto, Flat-Lay, Model)
   - Category (Auto, Top, Bottom, Full-body)
   - Run mode (Performance, Balanced, Quality)
   - Advanced settings (Seed, Number of samples)
4. Click "Run Try-On" to see the results

## API Parameters Explained

- **Category**: Determines how the API interprets the clothing item
  - `Auto`: Automatically detect garment type (best for general use)
  - `Top`: Upper body garments like shirts, t-shirts (most reliable category)
  - `Bottom`: Lower body garments like pants, skirts (requires clear garment image)
  - `Full-body`: Complete outfits like dresses, jumpsuits (requires full-body model)

- **Photo Type**: Helps optimize processing based on garment image style
  - `Auto`: Automatic detection (general use)
  - `Flat-Lay`: Garment laid flat (e-commerce product images)
  - `Model`: Garment worn by a model (photos with people)

- **Run Mode**: Balances processing speed vs. quality
  - `Performance`: Fastest processing (~7s), lower quality
  - `Balanced`: Good balance of speed (~9s) and quality
  - `Quality`: Best results but slowest (~13s)

- **Other Settings**: 
  - `Segmentation Free`: May improve quality for complex backgrounds
  - `Seed`: Controls randomness for reproducible results
  - `Number of Samples`: Generate multiple variations (1-4)

## Image Preprocessing

This application implements best practices for image preprocessing before sending to the FASHN API:

- **Resize**: Images with height exceeding 2000px are automatically resized while maintaining aspect ratio
- **Format**: Images are converted to JPEG format with a quality setting of 95%
- **Base64 Encoding**: Images are sent as base64 strings rather than URLs for simplicity in this demo app
  (Note: In production, FASHN recommends using CDN-hosted images for better performance)

These preprocessing steps help ensure optimal performance with the API while keeping payload sizes reasonable.

## Best Practices for Better Results

- **Image Ratio**: Use 2:3 aspect ratio for best results
- **Single Subject**: Include only one person per model image
- **Framing**: Focus/zoom on the subject to fill most of the frame
- **Pose Consistency**: Use similar poses between model and garment images
- **Image Quality**: Higher resolution and clear lighting improve output quality

## Deployment

You can deploy this application to any hosting platform that supports Next.js applications. Make sure to set up your environment variables (`FASHN_API_KEY`) on your hosting platform.

## Helpful Guides and Documentation
To get the most out of the FASHN API, we recommend to read the following guides to better understand all node features and parameters:

- [API Parameters Guide](https://docs.fashn.ai/guides/api-parameters-guide?utm_source=nextjs-tryon-app&utm_medium=readme&utm_campaign=documentation)
- [Official API Docs](https://docs.fashn.ai/fashn-api/endpoints#request?utm_source=nextjs-tryon-app&utm_medium=readme&utm_campaign=documentation)

## Features

- **Virtual Try-On**: Apply clothing items to model photos using FASHN AI's advanced VITON technology
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Client-side Image Preprocessing**: Automatic resizing and optimization for API best practices
- **Example Images**: Built-in examples to explore capabilities without uploading files
- **Advanced Controls**: Multiple generation modes, seed control, and batch processing

## Technical Overview

**Frontend Stack**: React with Next.js App Router, TypeScript, TailwindCSS, and Framer Motion for animations

**Key Components**:
- Animated UI with smooth transitions and micro-interactions
- Custom form elements with visual feedback
- Three-column modular layout (model, garment, controls)
- Full-screen results modal with navigation
- Interactive tips and help system

**Backend**: Serverless API routes with secure FASHN API integration, client-side image preprocessing using Canvas API, and error handling

## Contributing

We welcome contributions to improve this application! Feel free to submit issues or pull requests.

## License

This project is open source and available under the MIT License.# tryonstylehub
