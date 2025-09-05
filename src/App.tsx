import './App.css'
import Header from './components/Header.tsx'
import ShapeSelector from './components/ShapeSelector.tsx'

function App() {
  return (
    <div className="min-h-dvh bg-slate-50/80">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:py-10">
        <Header />

        <div className="mt-6 rounded-2xl border border-slate-200/70 bg-white/90 p-6 shadow-lg backdrop-blur">
          <ShapeSelector />
        </div>
      </div>
    </div>
  )
}

export default App
