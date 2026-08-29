import { Link } from "react-router";

const Register = () => {
  return (
    <div className="w-full flex flex-col text-center max-w-sm gap-4 border border-neutral-500/10 backdrop-blur-xl bg-neutral-900/40 p-10 rounded-2xl">
      <h1 className="text-2xl font-bold mb-6">Sign up</h1>
      <form className="flex flex-col gap-4">
        <input
          type="text"
          placeholder="Username"
          className="border border-neutral-700/60 bg-neutral-600/40 px-3 py-1.5 rounded-2xl focus:outline-none focus:border-blue-600"
        />
        <input
          type="password"
          placeholder="Password"
          className="border border-neutral-700/60 bg-neutral-600/40 px-3 py-1.5 rounded-2xl focus:outline-none focus:border-blue-600"
        />
        <p className="text-sm text-red-500">error_message</p>
        <button
          type="submit"
          className="bg-blue-600 text-white py-2 rounded-2xl hover:bg-blue-700"
        >
          Log In
        </button>
      </form>
      <p className="text-sm text-neutral-500">
        Already have an account?{" "}
        <Link to="/login" className="text-blue-700 hover:text-blue-900">
          Log in
        </Link>
      </p>
    </div>
  );
};

export default Register;
