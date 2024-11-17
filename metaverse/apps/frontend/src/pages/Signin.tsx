import { useState } from "react";
import Googlesigninbutton from "../components/googlesigninbutton";
import axios from "axios";
import { useNavigate } from "react-router-dom";
const SignIn = () => {
  const [form, setForm] = useState({ username: "", password: "" });
  const navigate = useNavigate()

  const handleInputChange = (e:any) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSignIn = async(e:any) => {
   try{
    e.preventDefault();
    const res = await axios.post("http://localhost:3000/api/v1/signin",{
      username:form.username,
      password:form.password
    })
    const token = res.data.token;
    console.log(token)
    //here we have to set the token in the localstorage of browser
    localStorage.setItem("authToken",`bearer ${token}`)

    navigate("/dashboard")
   }catch(e){
    console.error(e,"error while signin")
   }

  };

  // const handleGoogleSignIn = () => {
  //   // Add Google Sign-In logic here
  //   console.log("Google Sign-In");
  // };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white px-4">
      <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
        Sign In to MetaSpace
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
      <div className="mt-6 bg-purple-600 p-2">
        <Googlesigninbutton/>
      </div>
      <p className="mt-8 text-gray-400">
        Don’t have an account?{" "}
        <a href="/signup" className="text-violet-400 hover:underline">
          Sign Up
        </a>
      </p>
    </div>
  );
};

export default SignIn;
