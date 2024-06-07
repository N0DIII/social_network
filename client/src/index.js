import ReactDOM from 'react-dom/client';

import { Provider } from './components/context';
import App from './app.js';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <Provider>
        <App />
    </Provider>
)