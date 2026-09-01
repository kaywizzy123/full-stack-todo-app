import { Link } from "react-router";

const Home = () => {
  return (
    <div className="flex flex-col justify-center items-center gap-4">
      <div className="flex flex-col justify-center items-cent text-center gap-2">
        <h1 className="text-5xl font-bold">
          Todo<span className="text-blue-700">App</span>
        </h1>
        <p className="text-neutral-500">
          Make the best out of your day with the best planning app
        </p>
      </div>
      <div>
        <Link
          to="/login"
          className="bg-blue-600 px-4 py-2 rounded transition-all hover:bg-blue-700 hover:-translate-y-1 inline-block"
        >
          Get Started
        </Link>
      </div>
    </div>
  );
};

export default Home;
