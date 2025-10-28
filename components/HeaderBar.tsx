import React from "react";

const HeaderBar: React.FC = () => {
  return (
    <div className="absolute top-4 left-0 right-0 flex justify-center pointer-events-none z-50">
      <div className="inline-block bg-gradient-to-tr from-brand-1 to-brand-2 rounded-xl px-6  py-3 shadow-md pointer-events-auto">
        <h1 className="font-poppins text-3xl tracking-tight leading-none text-white">
          caff.<span>io</span>
        </h1>
      </div>
    </div>
  );
};

export default HeaderBar;
 