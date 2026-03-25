import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import AppRoutes from './routes/AppRoutes';
import './styles/global.css';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1e2230',
              color: '#eef0f6',
              border: '1px solid #2a3045',
              fontSize: '14px',
              fontFamily: "'DM Sans', sans-serif",
            },
            success: { iconTheme: { primary: '#2dd68c', secondary: '#0d0f14' } },
            error:   { iconTheme: { primary: '#ff4f6a', secondary: '#0d0f14' } },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}
