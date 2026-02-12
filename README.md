# Archi Select

An Expo mobile application inspired by
**The Architect’s Studio Companion: Rules of Thumb for Preliminary Design**
by Edward Allen and Joseph Iano.

---

## About this project

This repository is an [Expo](https://expo.dev) project created with [`create-expo-app`]. Archi Select is an architectural tool that helps architects and students make preliminary structural decisions using rules-of-thumb and visual guidance.

You can develop and run the app with the standard Expo workflow described below.

---

## Get started (Expo)

1. Install dependencies

```bash
npm install
```

2. Start the Metro/Expo dev server

```bash
npx expo start
```

In the Expo dev tools you'll find options to open the app in:

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go)

This project uses file-based routing; edit files in the `app/` directory to make changes.

If you want a fresh starter, run:

```bash
npm run reset-project
```

---

## Purpose

### Main Objective

Assist architects in estimating and identifying appropriate structural materials and preliminary dimensions for key structural elements (columns, beams, floor slabs) based on architectural inputs such as span length and grid configuration.

This is a conceptual and educational tool—not a substitute for licensed structural engineering.

---

## Core Features

- Preliminary structural sizing using rules of thumb
- Material recommendation and comparative insights
- Material knowledge library with visual explanations
- Project history and ability to save studies

---

## Application Structure (Tab Bar)

- **Home** — Design and Calculation Workspace (inputs, generated estimates, save)
- **Materials** — Learning and Reference Section (Concrete, Steel, Timber, Masonry)
- **History** — Project Archive (saved studies and comparisons)

---

## Design Philosophy

Architecture-first: prioritize conceptual reasoning, visual clarity, and design intuition over numerical complexity. UI follows principles inspired by platform guidelines for legibility and consistency.

---

## Disclaimer

Results are for preliminary guidance only; always consult and obtain approval from a licensed structural engineer for design decisions and construction.

---

## Reference

Allen, Edward, and Iano, Joseph.
_The Architect’s Studio Companion: Rules of Thumb for Preliminary Design._ Wiley.

---

## Project Status

Active development — intended as an educational/professional design-support tool.
