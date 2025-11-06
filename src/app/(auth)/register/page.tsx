import React from "react";
import { RegisterForm } from "./_components/registerform";
import { requireUnAuth } from "@/lib/auth-utils";

const RegisterPage = async() => {
  await requireUnAuth();
  return <RegisterForm />;
};

export default RegisterPage;
