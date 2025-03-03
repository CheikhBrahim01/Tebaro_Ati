import React from 'react';
import { useForm } from 'react-hook-form';
import axios from "../../api/api";


function VerifyOTP() {
  const { register, handleSubmit } = useForm();

  const onSubmit = async (data) => {
    try {
      const response = await axios.post('/users/verify-otp/', data);
      alert(response.data.message);
    } catch (error) {
      console.error(error.response.data);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('otp', { required: true })} placeholder="Enter OTP" />
      <button type="submit">Verify</button>
    </form>
  );
}

export default VerifyOTP;
