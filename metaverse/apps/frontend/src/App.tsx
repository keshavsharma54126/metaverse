import "./App.css";
import {BrowserRouter,Routes,Route} from "react-router-dom"
import LandingPage from "./pages/LandingPage";
import Signup  from "./pages/Signup";
import Signin from "./pages/Signin";
import Dashboard from "./pages/Dashboard";
import Space from "../src/components/space"
import AdminSignIn from "./pages/AdminSignIn";
import AdminDashboard from "./pages/AdminDashboard";
import MapMaker from "./pages/MapMaker";
function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage/>}/>
          <Route path="/signup" element={<Signup/>}/>
          <Route path="/signin" element={<Signin/>}/>
          <Route path="/adminsignin" element={<AdminSignIn/>}/>
          <Route path="/dashboard" element={<Dashboard/>}/>
          <Route path="/adminDashboard" element={<AdminDashboard/>}/>
          <Route path="/world" element={<Space/>}/>
          <Route path="/mapMaker" element={<MapMaker/>} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
