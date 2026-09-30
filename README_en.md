# Return and Refund Order Screenshot Generator

[中文](https://github.com/sakmist/Return-and-refund-order-screenshot-generator/blob/main/README.md)

An online tool for generating return and refund order screenshots. It helps users quickly generate realistic-looking return order screenshots, primarily for learning purposes.

> ⚠️ Disclaimer: This tool is for learning and communication purposes only. Do not use it for forgery or misleading others. The actual shipping information must be consistent with the real express information.

## Features

- Quickly generate Pinduoduo return and refund order screenshots
- Customizable recipient name, phone number, and address
- Automatic parsing and filling of contact information from clipboard
- One-click generation of high-definition screenshots for download
- Responsive design supporting different screen sizes

## How to Use

```bash
npm install
npm run dev
```

Open the local address printed in the terminal (http://localhost:5173 by default), then:

1. Fill in the relevant information in the form on the right:
   - Recipient (including name and phone number)
   - Shipping address
2. Click the "Generate Screenshot" button
3. The browser will automatically download the generated screenshot

### Auto-fill Feature

You can copy a text containing name, phone number, and address, then click the "Paste Auto Fill" button, and the system will automatically parse and fill the corresponding fields.

Example format:
```
Recipient: Zhang San 13812345678
Shipping Address: Room 123, Some Building, Some Street, Chaoyang District, Beijing
```

## Technical Implementation

- Vue 3 (`<script setup>` single-file components with composables)
- Vite for bundling, Tailwind CSS for styling
- Uses modern-screenshot (SVG foreignObject) so the browser rasterizes the real DOM and text lands where the preview shows it
- Configurable fields and layer display

## Project Structure

```
index.html                  # Vite entry
public/config.json          # Runtime config (fields and layers)
src/
  main.js                   # App entry
  App.vue                   # Layout and state orchestration
  style.css                 # Tailwind directives and custom styles
  components/
    PreviewScreen.vue       # Screenshot stage container
    LayerNode.vue           # Recursive layer renderer (nested groups)
    ControlPanel.vue        # Sidebar controls
    ConfigField.vue         # Single config field input
  composables/
    useOrderConfig.js       # Load config, hold form values and layer text
    useScreenshot.js        # Capture and download
    useClipboardAutofill.js # Clipboard parsing and autofill
  utils/
    address.js              # Name/phone/address text parsing
    field.js                # Derive input attributes from a field
    time.js                 # Time formatting
  assets/                   # Fonts and background image (handled by Vite)
```

## Configuration

The project is configured via [public/config.json](public/config.json):

- `fields`: Defines form fields
- `layers`: Defines layer elements and their styles in the screenshot

`layers` supports the `group` type with nested `children`. A layer renders its `text` when `type` is `static`, otherwise it renders the form value of its `fieldId`.

## Build and Deploy

```bash
npm run build     # Output to dist/
npm run preview   # Preview the production build locally
```

The build uses relative paths (`base: './'`), so it can be deployed to any static host, including sub-path hosting.

## Notes

- This tool is created solely for learning and exchange purposes
- Do not use the generated screenshots for illegal purposes
- Ensure the authenticity and accuracy of all information when actually using
- The shipping information must be consistent with the real information on the express bill

## License

This project is for personal learning use only.
