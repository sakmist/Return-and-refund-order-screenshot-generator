# Return and Refund Order Screenshot Generator

An online tool for generating return and refund order screenshots. It helps users quickly generate realistic-looking return order screenshots, primarily for learning purposes.

> ⚠️ Disclaimer: This tool is for learning and communication purposes only. Do not use it for forgery or misleading others. The actual shipping information must be consistent with the real express information.

## Features

- Quickly generate Pinduoduo return and refund order screenshots
- Customizable recipient name, phone number, and address
- Automatic parsing and filling of contact information from clipboard
- One-click generation of high-definition screenshots for download
- Responsive design supporting different screen sizes

## How to Use

1. Open the `return.html` file (recommended to use modern browsers like Chrome/Firefox)
2. Fill in the relevant information in the form on the right:
   - Recipient (including name and phone number)
   - Shipping address
3. Click the "Generate Screenshot" button
4. The browser will automatically download the generated screenshot

### Auto-fill Feature

You can copy a text containing name, phone number, and address, then click the "Paste Auto Fill" button, and the system will automatically parse and fill the corresponding fields.

Example format:
```
Recipient: Zhang San 13812345678
Shipping Address: Room 123, Some Building, Some Street, Chaoyang District, Beijing
```

## Technical Implementation

- Built with Vue.js for interface interactions
- Uses html2canvas for webpage screenshot functionality
- Configurable fields and layer display
- Supports responsive layout

## Configuration

The project is configured via [config.json](config.json):

- `fields`: Defines form fields
- `layers`: Defines layer elements and their styles in the screenshot

## Local Execution

Simply open the `return.html` file in your browser to use it. No additional server support is required.

## Notes

- This tool is created solely for learning and exchange purposes
- Do not use the generated screenshots for illegal purposes
- Ensure the authenticity and accuracy of all information when actually using
- The shipping information must be consistent with the real information on the express bill

## License

This project is for personal learning use only.
