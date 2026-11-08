import "../../../App.css";
import { Sidebar } from "../../utility/universal/sidebar";
import { LeftBar } from "../../utility/universal/LeftBar.jsx";
import { MusicLibrary } from "./MusicLibrary.jsx";
import { Hero } from "./Hero";

export const Dashboard = () => {
  return (
    <div className="min-h-screen w-full overflow-x-clip">
      <Sidebar />
      <LeftBar />
      <Hero />

      <div className="music-by-type min-h-screen w-full bg-current flex flex-col justify-center items-start pt-50 p-20 pl-30 gap-5">
        <h1 className="font-bold text-3xl text-white">Trending by type</h1>
        <MusicLibrary/>
      </div>
    </div>
  );
};

export default Dashboard;
