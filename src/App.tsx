import QuizContainer from "./components/QuizContainer";
import background from "../src/assets/video/blue-background-spiral.mp4"

function App() {
  return (
    <div className="App h-screen w-screen overflow-hidden relative">
      <video autoPlay loop muted playsInline className="absolute w-full h-full object-cover">
        <source src={background} type="video/mp4" />
        Tu navegador no soporta videos HTML5.
      </video>
      <div className="w-full h-full absolute flex justify-center items-center">
        <QuizContainer />
      </div>
    </div>
  );
}

export default App;
