import { createRoot } from 'react-dom/client';
import MaintenanceMode from './components/maintenance/MaintenanceMode';
import './styles/maintenance.css';

createRoot(document.getElementById('root')!).render(<MaintenanceMode />);
