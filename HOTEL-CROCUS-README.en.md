# Crocus — Mountain Retreat in Tatariv

[Українська](HOTEL-CROCUS-README.md) · [English](HOTEL-CROCUS-README.en.md)

A responsive single-page website for Crocus, a mountain retreat in the Ukrainian Carpathians. The website introduces prospective guests to the available rooms and amenities, provides location and travel information, and accepts booking requests.

[View Live Website](https://log1st1ck.github.io/Crocus-Tatariv/) · [View Repository](https://github.com/log1st1ck/Crocus-Tatariv)

![Crocus website homepage](assets/project-hotel-crocus-screenshot.png)

## Project Overview

Crocus is a static frontend website built without a CMS or build tooling. The interface uses only HTML, CSS, and JavaScript, making the project easy to deploy to GitHub Pages or any other static hosting provider.

Its primary purpose is to give prospective guests all the essential information in one place and provide a clear path from discovering the property to submitting a booking request.

## Key Features

### Property Information

- Hero section with prominent calls to action for booking a stay and exploring the available rooms
- Property overview, key selling points, and essential statistics
- Room cards with photographs, capacity, descriptions, and nightly rates
- Dedicated rate table, including group accommodation options
- Amenities catalog covering shared kitchens, saunas, a conference room, outdoor activities, parking, Wi-Fi, group stays, and housekeeping services
- Address, GPS coordinates, and directions by car or public transport
- Embedded Google Map
- Contact details and check-in and check-out policies

### Booking Experience

- Quick-booking form within the contact section
- Separate booking modal accessible from the header and room cards
- Automatic room selection based on the room card used to open the booking form
- Check-in and check-out date pickers powered by Flatpickr with Ukrainian localization
- Restrictions on past dates and validation that the check-out date follows the check-in date
- Guest-count selector within the booking modal
- Input sanitization and validation for names, phone numbers, dates, room types, and guest counts
- Clear inline validation messages displayed next to the relevant fields
- Booking requests submitted through Google Apps Script for storage in Google Sheets
- Confirmation modal displayed after form submission

### Interface and Interactions

- Responsive layouts for desktop, tablet, and mobile devices
- Mobile navigation with reliable state management and synchronized `aria-expanded` updates
- Room and amenity galleries with a large preview, thumbnails, image counters, and navigation controls
- Keyboard support for galleries using `Escape`, `ArrowLeft`, and `ArrowRight`
- Subtle hero parallax effect rendered through `requestAnimationFrame`
- Support for the user's `prefers-reduced-motion` setting
- Smooth in-page navigation between sections
- Fallback image handling for the room galleries

### SEO

- Semantic page structure
- Optimized `title`, `description`, `keywords`, and geolocation metadata
- Open Graph and Twitter Card metadata for rich link previews
- JSON-LD structured data using the `LodgingBusiness` type
- Structured property data covering the address, coordinates, phone numbers, amenities, and room types
- Descriptive alternative text for images
- Canonical URL, robots meta directives, and localized Ukrainian content

## Technology Stack

| Technology | Purpose |
| --- | --- |
| HTML5 | Semantic structure, forms, SEO, and JSON-LD |
| CSS3 | Responsive layouts, animations, modal windows, and component styling |
| Vanilla JavaScript | Validation, booking flow, galleries, navigation, and interactive states |
| Flatpickr | Localized check-in and check-out date pickers |
| Google Apps Script | Booking-request endpoint |
| Google Maps | Embedded property location |
| Google Fonts | Montserrat and Cormorant Garamond typefaces |
| GitHub Pages | Static website hosting |

## Project Structure

```text
Crocus-Tatariv/
├── index.html          # Page markup, forms, and SEO
├── style.css           # Styling, responsive layouts, and animations
├── script.js           # Booking, navigation, and gallery logic
├── README.md
├── logo.png
└── images/
    ├── background/     # Background images
    ├── standrt/        # Standard room photographs
    ├── family/         # Family room photographs
    ├── 4misnyi/        # Quadruple room photographs
    ├── sauna/          # Sauna gallery
    ├── conference/     # Conference room gallery
    ├── active/         # Outdoor activities
    ├── parking/        # Parking area and grounds
    └── ...             # Logo, favicon, and amenity icons
```

## Running Locally

The project does not require npm packages or a build step.

```bash
git clone https://github.com/log1st1ck/Crocus-Tatariv.git
cd Crocus-Tatariv
python3 -m http.server 8080
```

Once the server is running, open [http://localhost:8080](http://localhost:8080).

An internet connection is required to load Google Fonts, Flatpickr, and Google Maps, and to submit booking requests through Google Apps Script.

## Pre-deployment Checklist

1. Set the deployed Google Apps Script URL in the `GOOGLE_SCRIPT_URL` constant in `script.js`.
2. Replace `https://ВАШ-ДОМЕН.ua/` with the production domain in the canonical URL, Open Graph metadata, Twitter Card metadata, and JSON-LD.
3. Add the correct social-sharing image at `images/cover.jpg`, or update the relevant metadata paths.
4. Add `manifest.webmanifest`, or remove its reference from the HTML.
5. Add `images/kitchen/1.jpg`–`8.jpg` if the kitchen gallery is intended to be enabled.
6. Test the complete booking flow after deployment and confirm that submissions are stored correctly in Google Sheets.

> The functions `sendTelegram()` and `sendTelegramModal()` retain legacy names. In the current implementation, booking requests are submitted through Google Apps Script; there is no Telegram API integration.

## Deployment

The website is live on GitHub Pages:

**https://log1st1ck.github.io/Crocus-Tatariv/**

To deploy another copy, publish the files from the `main` branch to a static hosting provider. No compilation or build command is required.

---

Built as a complete frontend project for presenting the property and collecting booking requests.
