# PioMart E-Commerce Platform

![PioMart Banner](https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=2070&auto=format&fit=crop)

PioMart is a modern, high-performance e-commerce web application built with a focus on speed, user experience, and a sleek, high-density aesthetic inspired by leading global marketplaces like AliExpress. 

## ✨ Key Features

- **Modern Shopping Experience**: A fully responsive, fluid layout that seamlessly adapts from mobile to ultrawide desktop monitors.
- **Dynamic Product Grids**: High-density product displays allowing users to browse more items with less scrolling.
- **Real-time Authentication**: Secure user sign-up, login, and session management using Firebase Authentication.
- **Product Management**: 
  - Authorized users can easily add new products to the catalog.
  - Automatic image hosting powered by **Cloudinary**.
  - Users have exclusive rights to **edit** and **delete** the products they have personally uploaded.
- **Premium Product Details**: A conversion-optimized product details page featuring sticky mobile "Add to Cart" call-to-actions, dynamic pricing displays, and trust badges.
- **Lightning Fast Routing**: Powered by TanStack Router for instant, client-side page transitions.

## 🛠️ Tech Stack

This project leverages a cutting-edge frontend stack:

- **Framework**: [React 18](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Routing**: [TanStack Router](https://tanstack.com/router/latest)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with a custom design system.
- **Backend & Database**: [Firebase](https://firebase.google.com/) (Firestore, Auth)
- **Media Hosting**: [Cloudinary](https://cloudinary.com/) API
- **Icons**: [Lucide React](https://lucide.dev/)

## 🚀 Getting Started

### Prerequisites

Make sure you have Node.js (v18 or higher) installed on your machine.

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/AmarAhmedDev/PRODIGY_FS_03.git
   cd PRODIGY_FS_03/local-bloom
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Create a `.env` file in the root directory and add your Firebase and Cloudinary credentials:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   
   VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
   VITE_CLOUDINARY_UPLOAD_PRESET=your_unsigned_preset
   ```

4. **Start the Development Server**
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:5173`.

## 📂 Project Structure

- `/src/components` - Reusable UI components (Navbar, Footer, ProductCards, etc.)
- `/src/contexts` - React Context providers for global state (Auth, Cart)
- `/src/hooks` - Custom React hooks for data fetching
- `/src/lib` - Utility functions and Firebase configuration
- `/src/routes` - Page-level components managed by TanStack Router

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the issues page.

## 📝 License

This project is open source and available under the [MIT License](LICENSE).
