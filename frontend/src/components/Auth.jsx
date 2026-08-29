import { Outlet } from "react-router";

const Auth = ({ onLoginSuccess }) => {
  return (
    <div className="flex min-h-screen w-screen bg-neutral-950 text-neutral-300">
      <div className="flex flex-1 items-center justify-center p-8">
        <Outlet context={{ onLoginSuccess }} />
      </div>
      <div className="hidden md:flex flex-1 items-center justify-center bg-[url('/bg.jpg')] bg-cover bg-center"></div>
    </div>
  );
};

export default Auth;
