# Floorplan Designer - Project Overview

## Business Context

The Floorplan Designer is a specialized web application built to help users create and share detailed floorplans with renovation companies. The primary focus is on planning the placement of electrical elements and IoT devices, including:

- Electrical sockets
- Light switches
- IoT sensors
- Lighting fixtures
- Other custom elements

This tool bridges the gap between homeowners/clients and renovation professionals by providing a visual, shareable representation of renovation requirements. The ability to export as a static website ensures that plans can be easily shared without requiring recipients to have specific software.

### Target Users

1. **Homeowners/Clients**: Who need to communicate renovation requirements
2. **Renovation Companies**: Who need to understand client requirements precisely
3. **Electrical Contractors**: Who need specific placement information for installations

### Core Business Value

- **Reduced Miscommunication**: Visual representation eliminates ambiguity in requirements
- **Time Savings**: Faster planning and communication process
- **Cost Efficiency**: Fewer errors and changes during renovation
- **Documentation**: Provides a permanent record of planned installations

## Technical Overview

### Tech Stack

- **Framework**: Next.js with TypeScript
- **Styling**: Tailwind CSS
- **Code Quality**: ESLint + Prettier
- **Export Capability**: Static site generation (SSG)

### Project Structure

```
floorplan/
├── .github/                # GitHub-related files and documentation
├── public/                 # Static assets
├── src/                    # Source code
│   ├── app/                # Next.js App Router components
│   │   ├── layout.tsx      # Root layout component
│   │   └── page.tsx        # Home page component
│   ├── components/         # Reusable React components
│   │   └── FloorplanViewer.tsx  # Floorplan display component
│   ├── lib/                # Utility functions and business logic
│   │   └── floorplan-utils.ts   # Floorplan-related utilities
│   └── styles/             # CSS styles
│       └── globals.css     # Global styles including Tailwind directives
├── .eslintrc.json         # ESLint configuration
├── .prettierrc            # Prettier configuration
├── next.config.js         # Next.js configuration
├── postcss.config.js      # PostCSS configuration for Tailwind
├── tailwind.config.ts     # Tailwind CSS configuration
└── tsconfig.json          # TypeScript configuration
```

### Key Components

1. **FloorplanViewer**: The core component responsible for rendering and interacting with the floorplan.

2. **Floorplan Utilities**: Located in `src/lib/floorplan-utils.ts`, contains:
   - Type definitions for floorplan elements
   - Core utility functions for working with floorplan data
   - Distance calculations and element ID generation

### Data Structures

The project uses TypeScript interfaces to define the floorplan data:

- **FloorplanElement**: Represents individual elements on the floorplan (sockets, switches, etc.)
- **FloorplanData**: Contains the overall floorplan information including dimensions and scale

### Export Strategy

The application is configured to generate static exports (`output: 'export'` in next.config.js), which:

- Makes the floorplan shareable via simple web hosting
- Removes server dependencies for viewing
- Allows for easy distribution to stakeholders without technical expertise

### Development Workflow

1. Use `npm run dev` for local development
2. Use `npm run build` to generate the static export in the `out` directory
3. The exported static site can be hosted on any static file hosting service

## Future Development Areas

The current implementation provides the foundational structure. Future iterations should focus on:

1. Interactive element placement capabilities
2. Saving/loading floorplan designs
3. PDF export functionality
4. Mobile responsiveness improvements
5. User authentication (if multi-user support is needed)
6. Collaborative editing features

## Contribution Guidelines

When contributing to this project, please:

1. Follow the established code style (enforced by ESLint/Prettier)
2. Maintain type safety with proper TypeScript usage
3. Keep components modular and reusable
4. Update documentation when changing core functionality
5. Consider static export compatibility when adding features

---

This documentation serves as a high-level guide to understand the project structure and purpose. For detailed technical implementation, refer to the code and comments within specific files.
