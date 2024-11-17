import { useState } from "react";
import { ChevronRight } from "lucide-react";

const SignUp = () => {
  const [form, setForm] = useState({ username: "", password: "", confirmPassword: "" });

  const handleInputChange = (e:any) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSignUp = (e:any) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    // Add sign-up logic here
    console.log("Sign Up:", form);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white px-4">
      <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
        Sign Up for MetaSpace
      </h1>
      <form
        onSubmit={handleSignUp}
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
        <div className="mb-6">
          <label className="block text-gray-400 mb-2">Confirm Password</label>
          <input
            type="password"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleInputChange}
            className="w-full px-4 py-2 rounded-lg bg-black/50 text-white border border-gray-600 focus:ring-2 focus:ring-violet-500 outline-none"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white px-4 py-3 rounded-lg text-lg font-medium hover:opacity-90 transition"
        >
          Sign Up
        </button>
      </form>
      <p className="mt-8 text-gray-400">
        Already have an account?{" "}
        <a href="/signin" className="text-violet-400 hover:underline">
          Sign In
        </a>
      </p>
    </div>
  );
};

export default SignUp;
