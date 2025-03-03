import React from 'react';
import { useForm } from 'react-hook-form';
import axios from "../../api/api";


function Register() {
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    try {
      const response = await axios.post('/users/signup/', data);
      alert('Registration successful! Check your email for verification.');
    } catch (error) {
      console.error(error.response?.data || error.message);
      alert('Registration failed. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('username', { required: true })} placeholder="Username" />
      {errors.username && <p>Username is required</p>}

      <input {...register('email', { required: true })} placeholder="Email" />
      {errors.email && <p>Email is required</p>}

      <input {...register('phone_number', { required: true })} placeholder="Phone Number" />
      {errors.phone_number && <p>Phone number is required</p>}

      <input {...register('password', { required: true })} placeholder="Password" type="password" />
      {errors.password && <p>Password is required</p>}

      <input {...register('password2', { required: true })} placeholder="Confirm Password" type="password" />
      {errors.password2 && <p>Confirmation password is required</p>}

      <select {...register('user_type', { required: true })}>
        <option value="">Select User Type</option>
        <option value="Beneficiary">Beneficiary</option>
        <option value="Donor">Donor</option>
        <option value="Volunteer">Volunteer</option>
        <option value="Administrator">Administrator</option>
      </select>
      {errors.user_type && <p>User type is required</p>}

      <button type="submit">Register</button>
    </form>
  );
}

export default Register;
