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
│   ├── copilot-instructions.md # Project overview and instructions
│   └── workflows/          # GitHub Actions workflows
│       └── deploy.yml      # Deployment workflow to GitHub Pages
├── public/                 # Static assets
│   └── .nojekyll           # Prevents GitHub Pages from using Jekyll processing
├── src/                    # Source code
│   ├── app/                # Next.js App Router components
│   │   ├── layout.tsx      # Root layout component
│   │   └── page.tsx        # Home page component with main application logic
│   ├── components/         # Reusable React components
│   │   ├── ControlPanel.tsx  # Left sidebar - UI for device selection and configuration
│   │   ├── DeviceComponent.tsx # Individual device renderer
│   │   ├── DeviceDetailsPanel.tsx # Panel to show details of selected device
│   │   ├── FloorPlan.tsx   # Main floorplan visualization component
│   │   ├── GroupedDeviceComponent.tsx # Renderer for grouped devices
│   │   ├── NotesEditor.tsx # Component for adding text notes
│   │   ├── RoomHandles.tsx # Resize/drag handles for rooms
│   │   ├── RoomPanel.tsx   # UI for room management
│   │   └── shared/         # Shared components
│   │       └── FloorplanElements.tsx # Reusable elements for devices and groups
│   ├── contexts/           # React Context providers
│   │   └── FloorplanContext.tsx # Context for managing floorplan state
│   ├── hooks/              # Custom React hooks
│   │   ├── useGrid.ts      # Hook for grid logic
│   │   └── useWalls.ts     # Hook for wall management logic
│   ├── lib/                # Utility functions and business logic
│   │   └── floorplan-utils.ts   # Floorplan-related utilities
│   ├── types.ts            # TypeScript type definitions
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

1.  **FloorPlan**: The core component responsible for rendering the floorplan layout, including rooms, walls, and devices.
2.  **DeviceComponent**: Renders individual devices on the floorplan with appropriate icons and interactive behaviors.
3.  **GroupedDeviceComponent**: Renders devices that are grouped together.
4.  **ControlPanel**: Provides the user interface for selecting device types, mount positions, and managing devices.
5.  **DeviceDetailsPanel**: Displays detailed information about the currently selected device.
6.  **RoomPanel**: Enables room management functionality, including creation, editing, and deletion of rooms.
7.  **RoomHandles**: Provides interactive handles for room resizing and repositioning.
8.  **NotesEditor**: Allows users to add text annotations to the floorplan.
9.  **FloorplanElements**: Contains shared components used by both DeviceComponent and GroupedDeviceComponent:
    - **DraggableElement**: Reusable component that handles drag-and-drop functionality
    - **NotesIndicator**: Consistent notes icon with background
    - **MountPositionIndicator**: Handles consistent display of mount positions
    - **SizeIndicator**: Shows count of devices in a group

### Custom Hooks

1.  **useGrid**: Encapsulates logic related to the grid system, snapping, and coordinate calculations.
2.  **useWalls**: Manages the state and logic for drawing and interacting with walls on the floorplan.

### Shared Components Architecture

The project implements a component composition pattern for rendering devices:

```
FloorPlan
├── DeviceComponent
│   └── DraggableElement  # Handles drag-and-drop behavior
│       ├── MountPositionIndicator
│       └── NotesIndicator
└── GroupedDeviceComponent
    └── DraggableElement  # Same behavior for both device types
        ├── GroupMountPositionIndicator
        ├── SizeIndicator
        └── NotesIndicator
```

This architecture provides several benefits:

- **Reduced code duplication**: Common drag-and-drop behavior defined once
- **Consistent behavior**: Devices and groups behave identically when interacted with
- **Improved maintenance**: Changes to interaction behavior only need to be made in one place
- **Separation of concerns**: Visual representation is separated from interaction behavior

### Floorplan Utilities

Located in `src/lib/floorplan-utils.ts`, contains helper functions for:

- Element ID generation
- Distance calculations between points

### Data Structures

The project uses TypeScript interfaces and enums to define the floorplan data:

- **DeviceType**: Enumeration of supported devices (socket, switch, sensors, lights, etc.)
- **MountPosition**: Enumeration of possible mounting positions (wall-low, wall-medium, wall-high, ceiling)
- **Device**: Interface for device elements placed on the floorplan
- **Room**: Interface for room definitions and dimensions

### Features

The application provides the following features:

1. **Interactive Floorplan**: Visual display of rooms with drag-and-drop functionality
2. **Device Placement**: Ability to add various electrical and IoT devices to the floorplan
3. **Device Management**:
   - Rotation of devices
   - Changing mount positions
   - Deletion of devices
   - Grouping related devices together
   - Adding notes to devices
4. **Device Grouping**:
   - Create logical groups of related devices
   - Move groups as a single unit
   - Add notes to device groups
5. **Room Management**:
   - Create, edit, and delete rooms
   - Drag rooms to reposition
   - Resize rooms using interactive handles
   - Grid snapping for precise placement
   - Edit room properties (name, color, dimensions)
6. **Configuration Management**:
   - Export configuration as JSON
   - Import configuration from JSON
   - Auto-save to browser local storage

### Export Strategy

The application is configured to generate static exports (`output: 'export'` in next.config.js), which:

- Makes the floorplan shareable via simple web hosting
- Removes server dependencies for viewing
- Allows for easy distribution to stakeholders without technical expertise

### GitHub Pages Deployment

The project includes automated deployment to GitHub Pages:

1. **GitHub Actions Workflow**: Located in `.github/workflows/deploy.yml`, this configuration:

   - Triggers on pushes to the master branch or manual workflow dispatch
   - Sets up the appropriate Node.js environment
   - Builds the project using the `npm run build` command
   - Deploys the output to GitHub Pages

2. **Configuration Customizations**:

   - `basePath` in `next.config.js` ensures assets are properly loaded from the repository subdirectory
   - `.nojekyll` file prevents GitHub Pages from processing the output with Jekyll
   - `deploy` script in `package.json` combines build and `.nojekyll` file creation

3. **Access URL**: The deployed site is available at `https://[username].github.io/floorplan/`

### Development Workflow

1. Use `npm run dev` for local development
2. Use `npm run build` to generate the static export in the `out` directory
3. The exported static site can be hosted on any static file hosting service

---

This documentation serves as a high-level guide to understand the project structure and purpose. For detailed technical implementation, refer to the code and comments within specific files.
