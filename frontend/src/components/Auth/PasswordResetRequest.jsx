import React from 'react';
import { useForm } from 'react-hook-form';
import axios from "../../api/api";


function PasswordResetRequest() {
  const { register, handleSubmit } = useForm();

  const onSubmit = async (data) => {
    try {
      const response = await axios.post('/users/password-reset/', data);
      alert(response.data.message);
    } catch (error) {
      console.error(error.response.data);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email', { required: true })} placeholder="Email" />
      <button type="submit">Reset Password</button>
    </form>
  );
}

export default PasswordResetRequest;
