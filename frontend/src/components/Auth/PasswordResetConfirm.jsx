import React from 'react';
import { useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import axios from "../../api/api";


function PasswordResetConfirm() {
  const { token } = useParams();
  const { register, handleSubmit } = useForm();

  const onSubmit = async (data) => {
    try {
      const response = await axios.post(`/users/password-reset/confirm/`, { ...data, token });
      alert(response.data.message);
    } catch (error) {
      console.error(error.response.data);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('password', { required: true })} placeholder="New Password" type="password" />
      <input {...register('password2', { required: true })} placeholder="Confirm New Password" type="password" />
      <button type="submit">Reset Password</button>
    </form>
  );
}

export default PasswordResetConfirm;
