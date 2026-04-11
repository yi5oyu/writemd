import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ChakraProvider } from '@chakra-ui/react'
import App from './App.jsx'
import { AiConfigProvider } from './context/AiConfigContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ChakraProvider>
      <AiConfigProvider>
        <App />
      </AiConfigProvider>
    </ChakraProvider>
  </StrictMode>
)
