import { ArrowRight } from "lucide-react";
import Elements from "@/components/3D/elements";

const page = () => {
  return (
    <div className="overflow-x-hidden">

      {/* MAIN PAGE */}
      <div className="grid grid-cols-4 place-items-stretch">
        <div className="col-span-2 flex flex-col items-center justify-center">
          <h1 className="font-bold text-[3vw]">DEPLOY</h1>

          <button className="relative px-6 py-3 font-semibold border-2 border-black overflow-hidden group rounded-full cursor-pointer">
            <span className="absolute inset-0 bg-black -translate-x-full group-hover:translate-x-0 transition-transform duration-200" />
            <span className="flex gap-2 relative z-10 text-black group-hover:text-white transition-colors duration-200 font-bold">
              PLAY <ArrowRight />
            </span>
          </button>
        </div>

        <div className="col-span-2 overflow-hidden max-w-full">
          <Elements />
        </div>
      </div>

      {/* NEXT SECTION */}
      <div className="w-full h-screen bg-blue-300" />
    </div>
  );
};

export default page;
