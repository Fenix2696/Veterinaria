import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Configuración global para manejar errores no capturados
window.onerror = function(message, source, lineno, colno, error) {
  console.error('Error global:', { message, source, lineno, colno, error });
  // Aquí podrías enviar el error a un servicio de monitoreo
  return false;
};

// Configuración para manejar promesas rechazadas no capturadas
window.onunhandledrejection = function(event) {
  console.error('Promesa rechazada no manejada:', event.reason);
  // Aquí podrías enviar el error a un servicio de monitoreo
};

// Función para manejar errores de red
const handleNetworkError = () => {
  if (!navigator.onLine) {
    console.log('Sin conexión a internet');
    // Aquí podrías mostrar una notificación al usuario
  }
};

window.addEventListener('online', handleNetworkError);
window.addEventListener('offline', handleNetworkError);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Configuración de reportWebVitals
reportWebVitals(console.log);

// Limpieza de event listeners cuando se desmonta la aplicación
window.addEventListener('unload', () => {
  window.removeEventListener('online', handleNetworkError);
  window.removeEventListener('offline', handleNetworkError);
});