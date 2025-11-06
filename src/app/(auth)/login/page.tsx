import React from 'react'
import { LoginForm } from './_components/loginform'
import { requireUnAuth } from '@/lib/auth-utils';

const LoginPage = async() => {
  await requireUnAuth();
  return <LoginForm />;
}

export default LoginPage
