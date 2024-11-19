import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
const AdminSignIn = () => {
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  const [form, setForm] = useState({ username: "", password: "" });
  const navigate = useNavigate()

  const handleInputChange = (e:any) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSignIn = async(e:any) => {
   try{
    e.preventDefault();
    const res = await axios.post(`${BACKEND_URL}/signin`,{
      username:form.username,
      password:form.password
    })
    const token = res.data.token;
    console.log(token)
    //here we have to set the token in the localstorage of browser
    localStorage.setItem("authToken",`${token}`)
    navigate("/adminDashboard")
    
   }catch(e){
    console.error(e,"error while signin")
   }

  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white px-4">
      <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
       Hello Admin, Sign In to MetaSpace
      </h1>
      <form
        onSubmit={handleSignIn}
        className="w-full max-w-md bg-white/5 p-8 rounded-2xl backdrop-blur-sm"
      >
        <div className="mb-6">
          <label className="block text-gray-400 mb-2">Username</label>
          <input
            type="text"
            name="username"
            value={form.username}
            onChange={handleInputChange}
            className="w-full px-4 py-2 rounded-lg bg-black/50 text-white border border-gray-600 focus:ring-2 focus:ring-violet-500 outline-none"
            required
          />
        </div>
        <div className="mb-6">
          <label className="block text-gray-400 mb-2">Password</label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleInputChange}
            className="w-full px-4 py-2 rounded-lg bg-black/50 text-white border border-gray-600 focus:ring-2 focus:ring-violet-500 outline-none"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white px-4 py-3 rounded-lg text-lg font-medium hover:opacity-90 transition"
        >
          Sign In
        </button>
      </form>
    </div>
  );
};

export default AdminSignIn;
