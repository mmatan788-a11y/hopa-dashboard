import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from './context/AuthContext';
import { WishlistProvider } from "./context/WishlistContext.jsx";

import { Provider } from "react-redux";
import { store } from "./redux/store.js"; // Import your Redux store
import { Toaster } from 'react-hot-toast';
import 'react-toastify/dist/ReactToastify.css';
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <AuthProvider>
        <WishlistProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </WishlistProvider>
      </AuthProvider>
    </Provider>
  </StrictMode>
);
