
import floorPlanImage from './Sample_Floorplan.png';
import CanvasAnnotations from './components/CanvasAnnotations';

const App = () => {
  /*
  TODO: 
  1. Split into components
  2. Wrap actions as functions (such as save/load from local storage)
  3. Use hooks with usecallback?
  
  */
  
  return (
    <CanvasAnnotations floorPlanImage={floorPlanImage} />
  );
};

export default App;