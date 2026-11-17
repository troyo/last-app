import { MapsScreen } from '../../components/MapsScreen';

// The Maps tab. The real work lives in components/MapsScreen (the browser
// preview gets a simple stand-in, because maps need the phone's map engine).
export default function Maps() {
  return <MapsScreen />;
}
