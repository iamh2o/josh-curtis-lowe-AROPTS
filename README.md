# HintLens MVP

An Expo-based prototype for **HintLens**, an AR helper that overlays step-by-step instructions directly on top of appliance controls. The current MVP focuses on presenting pre-authored instructions for a Bosch washing machine, highlighting the correct controls as the user advances through a task.

## Features

- Requests camera access and renders a live preview with Expo Camera.
- Highlights the relevant control for the current instruction step.
- Lets users pick between multiple predefined goals for the same device.
- Provides quick feedback buttons to capture whether the instructions were helpful.
- Offers a web handoff link when a goal is completed so users can continue outside the app.
- Encodes goals and bounding boxes in a reusable JSON format located in `assets/instructions`.

## Getting started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the Expo development server:

   ```bash
   npm run start
   ```

3. Use the Expo Go app (iOS/Android) or an emulator to open the project and grant camera permissions when prompted.

> **Note:** This prototype relies on static instruction data and does not yet include device recognition or backend APIs. Bounding boxes are scaled relative to the camera preview using the `imageSize` metadata in the JSON file.

## Project structure

- `App.jsx` – Core UI flow: camera preview, goal picker, stepper UI, and feedback controls.
- `assets/instructions/*.json` – Instruction packs for supported device models.
- `app.json` – Expo configuration.
- `babel.config.js` – Babel configuration for Expo.
- `package.json` – Dependencies and npm scripts.

## Next steps

- Integrate an on-device classifier to preselect the correct instruction pack.
- Move instruction content into a backend service with telemetry to improve mappings.
- Expand the AR overlay from 2D highlights to anchored 3D meshes using ARKit/ARCore.
- Add voice guidance and accessibility affordances.
