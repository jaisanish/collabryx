/**
 * main.tsx
 * 
 * This is the primary entry point for the React frontend application.
 * It's responsible for taking the root React component (<App />) and 
 * injecting it into the actual HTML DOM (the <div id="root"> in index.html).
 */

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'

// Import global CSS styles, including Tailwind CSS directives
import './index.css'

// Find the root element in index.html and initialize the React tree
createRoot(document.getElementById('root')!).render(
  // StrictMode highlights potential problems in an application by running components twice in development
  <StrictMode>
    <App />
  </StrictMode>,
)
