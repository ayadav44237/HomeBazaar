import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  
  server:{
    proxy:{
      '/api':{
        target: 'https://anytime-property.onrender.com/api/listing/get',
        secure: false,
      }
    },
    
  },
  plugins: [react()],
})
