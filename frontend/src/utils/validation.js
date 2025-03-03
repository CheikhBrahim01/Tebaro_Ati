import * as yup from 'yup';

export const signupSchema = yup.object({
  phone_number: yup
    .string()
    .matches(/^[234]\d{7}$/, 'Invalid phone number')
    .required('Phone number is required'),
  full_name: yup
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .required('Full name is required'),
  email: yup
    .string()
    .email('Invalid email')
    .required('Email is required'),
  password: yup
    .string()
    .min(8, 'Password must be at least 8 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
      'Password must include uppercase, lowercase, number, and special character'
    )
    .required('Password is required'),
  password2: yup
    .string()
    .oneOf([yup.ref('password'), null], 'Passwords must match')
    .required('Confirm password is required'),
  
});

export const loginSchema = yup.object({
  phone_number: yup
    .string()
    .matches(/^[234]\d{7}$/, 'Invalid phone number')
    .required('Phone number is required'),
  password: yup.string().required('Password is required'),
});

export const twoFactorSchema = yup.object({
  token: yup
    .string()
    .length(6, 'Token must be 6 digits')
    .required('Verification code is required'),
});
