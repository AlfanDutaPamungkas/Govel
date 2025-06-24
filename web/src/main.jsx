import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import {Provider} from 'react-redux'
import {QueryClient, QueryClientProvider} from '@tanstack/react-query'
import { store } from './redux/store/store.js'

const client = new QueryClient();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <QueryClientProvider client={client}>
        <App />
      </QueryClientProvider>
    </Provider>
  </StrictMode>,
)
