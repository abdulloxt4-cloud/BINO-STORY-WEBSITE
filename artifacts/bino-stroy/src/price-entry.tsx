import { createRoot } from 'react-dom/client';
import './i18n';
import './index.css';
import PriceList from './pages/price-list';

createRoot(document.getElementById('root')!).render(<PriceList />);
