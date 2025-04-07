# Floorplan Designer for Renovations

A Next.js application for creating and sharing floorplans with renovation companies, focusing on the placement of electrical sockets, switches, IoT sensors, and other elements.

## Getting Started

First, install the dependencies:

```bash
npm install
# or
yarn install
```

Then, run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Features (Planned)

- Interactive floorplan designer
- Placement of electrical sockets, switches, and IoT sensors
- Export and share capabilities
- Responsive design for viewing on multiple devices

## Exporting for Sharing

To generate a static website that you can share with your renovation company:

```bash
npm run build
# or
yarn build
```

This will create an `out` directory with your static website files that can be deployed anywhere.

## GitHub Pages Deployment

This project is configured for automatic deployment to GitHub Pages. When you push changes to the main branch, GitHub Actions will automatically build and deploy your site to GitHub Pages.

### Manual Deployment

You can also manually trigger a deployment from the GitHub Actions tab in your repository.

### Deployment URL

Once deployed, your site will be available at `https://[your-github-username].github.io/floorplan/`

### Local Preview of Production Build

To preview the production build locally (with the GitHub Pages base path):

```bash
# Build with production settings
NODE_ENV=production npm run build
# Serve the output directory
npx serve out
```
