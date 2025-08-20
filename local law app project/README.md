# Local Law - Mobile App Prototype (In progress)

A React-based mobile app prototype for "Local Law" - an educational app about local laws. Built using Vite + React with a mobile-first design approach.
<img width="1910" height="938" alt="Screenshot 2025-08-19 193845" src="https://github.com/user-attachments/assets/4de9eadb-d06b-4a63-972f-b733d47119c6" />
<img width="1877" height="935" alt="Screenshot 2025-08-19 193854" src="https://github.com/user-attachments/assets/d60a5411-d3a7-4cf0-b63a-5261725e1560" />
<img width="1919" height="925" alt="Screenshot 2025-08-19 193909" src="https://github.com/user-attachments/assets/22c73b62-f612-452c-ac85-5cf62b9a344c" />
<img width="1867" height="931" alt="Screenshot 2025-08-19 193918" src="https://github.com/user-attachments/assets/59cd5bd5-9313-4ff2-b5dd-271018d51fc6" />
<img width="1910" height="939" alt="Screenshot 2025-08-19 193926" src="https://github.com/user-attachments/assets/a299d704-bf53-4e68-9c6c-b6e783a66150" />


## Features

- **4 Main Tabs**: Home, Search, Game, Settings
- **Location-based Law Information**: Hardcoded locations (Saanich, Sooke, Esquimalt)
- **Category Filtering**: Cycling, Business, Traffic laws
- **Search Functionality**: Grid of category icons with search bar
- **Calendar Popup**: Date selection interface
- **Settings**: Visual-only dropdowns for font size, notifications, etc.

## Tech Stack

- **Frontend**: React 18, Vite
- **Routing**: React Router DOM
- **Icons**: Lucide React
- **Styling**: CSS with custom variables for theming

## Project Structure

```
src/
├── components/
│   ├── HomePage.jsx          # Main feed with location selector and law cards
│   ├── SearchPage.jsx        # Category grid and search functionality
│   ├── GamePage.jsx          # Placeholder for future game features
│   ├── SettingsPage.jsx      # App settings and preferences
│   └── CalendarModal.jsx     # Calendar popup component
├── App.jsx                   # Main app component with routing
├── App.css                   # Mobile-specific styles
├── index.css                 # Global styles and CSS variables
└── main.jsx                  # App entry point
```

## Getting Started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the development server:

   ```bash
   npm run dev
   ```

3. Open your browser and navigate to the URL shown in the terminal (typically `http://localhost:5173`)

## Development Notes

- **Medium Fidelity Prototype**: No actual storage logic or backend integration
- **Mobile-First Design**: Optimized for mobile screens (max-width: 480px)
- **Placeholder Data**: All content uses hardcoded sample data
- **Visual-Only Features**: Settings and filters are for UI demonstration only

## Sample Data

The app includes sample laws for demonstration:

- Bicycle helmet requirements
- Business license renewals
- School zone speed limits
- Bike lane usage rules
- Business noise bylaws

## Future Enhancements

- Backend integration for real law data
- User authentication and profiles
- Interactive games and quizzes
- Push notifications for law updates
- Offline functionality+ Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
