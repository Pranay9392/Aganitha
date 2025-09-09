import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import MiniApp from './components/MiniApp'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <MiniApp/>
    </>
  )
}

export default App
