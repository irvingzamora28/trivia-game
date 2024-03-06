import QuizContainer from './components/QuizContainer';
import backgroundImage from './assets/images/background-image-1.png';

function App() {
  return (
    <div 
      className="App h-screen"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <QuizContainer />
    </div>
  );
}

export default App;
