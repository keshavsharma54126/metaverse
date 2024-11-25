import "./App.css";
import {BrowserRouter,Routes,Route} from "react-router-dom"
import LandingPage from "./pages/LandingPage";
import Signup  from "./pages/Signup";
import Signin from "./pages/Signin";
import Dashboard from "./pages/Dashboard";
import AdminSignIn from "./pages/AdminSignIn";
import AdminDashboard from "./pages/AdminDashboard";
import MapMaker from "./pages/MapMaker";
import Assignment from "./pages/Assignment";
import Spaces from "./pages/Spaces";
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
          <Route path="/map/:id" element={<MapMaker/>} />
          <Route path="/assignment" element={<Assignment/>} />
          <Route path="/space/:id" element={<Spaces/>} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
