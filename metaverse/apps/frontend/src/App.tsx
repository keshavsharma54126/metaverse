import { useState } from 'react'
import './App.css'
import MultiplayerSpace from './components/space'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>hello world
        <div>
          <MultiplayerSpace/>
        </div>
      </div>
    </>
  )
}

export default App
