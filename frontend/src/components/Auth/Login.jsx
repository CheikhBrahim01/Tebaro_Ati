import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import axios from "../../api/api";

const Login = () => {
  const [twoFactorRequired, setTwoFactorRequired] = useState(false);
  const [userId, setUserId] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // ---- Form for Initial Login ----
  const {
    register: registerLogin,
    handleSubmit: handleSubmitLogin,
    formState: { errors: loginErrors },
    reset: resetLoginForm,
  } = useForm({
    defaultValues: {
      phone_number: "",
      password: "",
    },
  });

  // ---- Form for 2FA Code ----
  const {
    register: register2FA,
    handleSubmit: handleSubmit2FA,
    formState: { errors: twoFAErrors },
    reset: reset2FAForm,
  } = useForm({
    defaultValues: {
      token: "",
    },
  });

  // ---- Submit Handler for Initial Login ----
  const onLoginSubmit = async (data) => {
    try {
      setError(null);

      const response = await axios.post("/users/login/", {
        phone_number: data.phone_number,
        password: data.password,
      });
      const serverData = response.data;

      if (serverData.two_factor_required) {
        // If the backend says 2FA is required, show the second form.
        setTwoFactorRequired(true);
        setUserId(serverData.user_id);
        reset2FAForm({ token: "" });
      } else {
        // Otherwise, store tokens and navigate accordingly.
        localStorage.setItem("access_token", serverData.access);
        localStorage.setItem("refresh_token", serverData.refresh);
        // If your logic is to go to a 2FA setup when 2FA is not required:
        navigate("/setup-2fa");
      }
    } catch (error) {
      // Extract a useful error message if present
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.detail ||
        "Login failed. Please check your credentials.";
      setError(errorMessage);
    }
  };

  // ---- Submit Handler for 2FA Code ----
  const onTwoFactorSubmit = async (data) => {
    try {
      setError(null);

      const response = await axios.post("/users/verify-2fa/", {
        user_id: userId,
        token: data.token,
      });
      const serverData = response.data;

      // Store tokens in localStorage
      localStorage.setItem("access_token", serverData.access);
      localStorage.setItem("refresh_token", serverData.refresh);

      // After successful verification, navigate to your dashboard (or wherever)
      navigate("/dashboard");
    } catch (error) {
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.detail ||
        "2FA verification failed. Please try again.";
      setError(errorMessage);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-cyan-300 via-sky-300 to-white">
      <div className="bg-white shadow-md rounded-lg p-8 w-full max-w-md mt-16 relative">
        <h2 className="text-center text-2xl font-bold text-cyan-500">
          {twoFactorRequired ? "Two-Factor Verification" : "Login"}
        </h2>
        <div className="mt-1 mx-auto w-16 h-1 bg-cyan-500 rounded absolute left-1/2 transform -translate-x-1/2"></div>

        {/* Show Error Message */}
        {error && (
          <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded relative">
            {error}
          </div>
        )}

        {/* Conditionally Render Login Form or 2FA Form */}
        {twoFactorRequired ? (
          /* -------------- 2FA FORM -------------- */
          <form
            onSubmit={handleSubmit2FA(onTwoFactorSubmit)}
            className="space-y-4 mt-6"
            autoComplete="off"
          >
            <div>
              <div className="mt-2 flex flex-row-reverse items-center rounded-full bg-gray-200 pr-3 focus-within:ring-2 focus-within:ring-cyan-500">
                <i className="bi bi-shield-lock text-gray-500 ml-2"></i>
                <input
                  {...register2FA("token", {
                    required: "Verification code is required",
                    maxLength: { value: 6, message: "Code must be 6 digits" },
                  })}
                  type="text"
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                  className="block w-full border-0 bg-gray-200 py-2 pr-2 pl-3 text-gray-900 placeholder-gray-500 focus:bg-gray-200 focus:outline-none rounded-full text-center"
                />
              </div>
              {twoFAErrors.token && (
                <p className="text-red-500 text-sm mt-1">
                  {twoFAErrors.token.message}
                </p>
              )}
            </div>

            <div>
              <button
                type="submit"
                className="w-full py-2 px-4 bg-cyan-500 text-white font-semibold rounded-full shadow-md hover:bg-cyan-400 focus:ring-2 focus:ring-cyan-400"
              >
                Verify
              </button>
            </div>
          </form>
        ) : (
          /* -------------- LOGIN FORM -------------- */
          <form
            onSubmit={handleSubmitLogin(onLoginSubmit)}
            className="space-y-4 mt-6"
            autoComplete="off"
          >
            {/* Phone Number */}
            <div>
              <div className="mt-2 flex flex-row-reverse items-center rounded-full bg-gray-200 pr-3 focus-within:ring-2 focus-within:ring-cyan-500">
                <i className="bi bi-telephone-fill text-gray-500 ml-2"></i>
                <input
                  {...registerLogin("phone_number", {
                    required: "Phone number is required",
                  })}
                  type="text"
                  placeholder="Phone Number"
                  className="block w-full border-0 bg-gray-200 py-2 pr-2 pl-3 text-gray-900 placeholder-gray-500 focus:bg-gray-200 focus:outline-none rounded-full"
                />
              </div>
              {loginErrors.phone_number && (
                <p className="text-red-500 text-sm mt-1">
                  {loginErrors.phone_number.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="mt-2 flex flex-row-reverse items-center rounded-full bg-gray-200 pr-3 focus-within:ring-2 focus-within:ring-cyan-500">
                <i className="bi bi-lock-fill text-gray-500 ml-2"></i>
                <input
                  {...registerLogin("password", {
                    required: "Password is required",
                  })}
                  type="password"
                  placeholder="Password"
                  className="block w-full border-0 bg-gray-200 py-2 pr-2 pl-3 text-gray-900 placeholder-gray-500 focus:bg-gray-200 focus:outline-none rounded-full"
                />
              </div>
              {loginErrors.password && (
                <p className="text-red-500 text-sm mt-1">
                  {loginErrors.password.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                className="w-full py-2 px-4 bg-cyan-500 text-white font-semibold rounded-full shadow-md hover:bg-cyan-400 focus:ring-2 focus:ring-cyan-400"
              >
                Sign In
              </button>
            </div>

            {/* Links */}
            <div className="text-center mt-4">
              <Link
                to="/password-reset"
                className="text-cyan-500 hover:text-cyan-600 text-sm font-medium"
              >
                Forgot your password?
              </Link>
            </div>
            <div className="text-center mt-4">
              <Link
                to="/signup"
                className="text-cyan-500 hover:text-cyan-600 text-sm font-medium"
              >
                Don't have an account? Sign Up
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Login;
