import { useRef, useContext,useState } from "react";
import { TextInput, Checkbox } from "flowbite-react"; // import TextInput and Checkbox from 'flowbite-react'
import axios from "axios";
import { redirect } from "react-router-dom";
import AuthContext from "../assets/Contexts/AuthContext.jsx";

const Login = () => {
  const nim = useRef();
  const [error,setError] = useState()
  const { login } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let payload = {
        nim : nim.current.value
      }
      await login(payload)
    } catch (error) {
      setError(error.response.data.message);
    }
  };

  return (
    <div className="text-center mt-24">
      <div className="flex items-center justify-center">
        <svg
          fill="none"
          viewBox="0 0 24 24"
          className="w-12 h-12 text-blue-500"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          />
        </svg>
      </div>
      <h2 className="text-4xl tracking-tight">Sign in into your account</h2>
      <div className="flex justify-center my-2 mx-4 md:mx-0">
        <form className="w-full max-w-xl bg-white rounded-lg shadow-md p-6">
          <div className="flex flex-wrap -mx-3 mb-6">
            <div className="w-full md:w-full px-3 mb-6">
              <label
                className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
                htmlFor="email"
              >
                NIM
              </label>
              <TextInput
                className="appearance-none block w-full bg-white text-gray-900 font-medium py-3 leading-tight focus:outline-none"
                type="text"
                id="nim"
                ref={nim}
                required
              />
            </div>
            <div className="w-full flex items-center px-3 mb-3 ">
              <label htmlFor="remember" className="flex items-center w-1/2">
                <Checkbox id="remember" className="mr-1 bg-white shadow" />
                <span className="text-sm text-gray-700 pt-1">Remember Me</span>
              </label>
            </div>
            <div className="w-full md:w-full px-3 mb-6">
              <button
                onClick={handleSubmit}
                className="appearance-none block w-full bg-blue-600 text-gray-100 font-bold border border-gray-200 rounded-lg py-3 px-3 leading-tight hover:bg-blue-500 focus:outline-none focus:bg-white focus:border-gray-500"
              >
                Sign in
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
