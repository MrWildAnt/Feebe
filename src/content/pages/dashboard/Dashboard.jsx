import "../../../App.css";
import { Hero } from "./Hero";

export const Dashboard = () => {
  return (
    <div className="min-h-screen w-full overflow-x-clip">
      <Hero />

      <div className="music-by-type min-h-screen w-full bg-current flex flex-col justify-center items-start p-20">
        <h1 className="font-bold text-3xl text-white">Trending by type</h1>
        <div className="slider">
          <div className="flex gap-5 h-120">

            <div className="flex-col">
              <div className="flex justify-center items-center gap-2">
                <img src="" alt="" />
                <div className="flex-col">
                  <h1></h1>
                  <p></p>
                </div>
              </div>
            </div>

            <div className="h-full w-[1px]"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
