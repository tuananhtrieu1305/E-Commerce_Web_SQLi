import AuthCover from "../../assets/authImages/Auth_Cover.png";

const Auth_Cover = () => {
  return (
    <>
      <div className="invisible lg:visible absolute top-0 left-0 bottom-0 right-1/2  bg-[#FAFAFD] flex justify-center items-center flex-col gap-[50px]">
        <figure className="max-w-[422px]">
          <img srcSet={`${AuthCover} 2x`} alt="Auth_Cover" />
        </figure>
        <span className="text-[#1A162E] poppins-semibold max-w-[422px] text-[18px] leading-[26px] text-center">
          The best of luxury brand values, high quality products, and innovative
          services
        </span>
      </div>
    </>
  );
};

export default Auth_Cover;
