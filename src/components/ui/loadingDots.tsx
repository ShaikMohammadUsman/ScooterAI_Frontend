import Image, { StaticImageData } from "next/image";
import { IoLogoOctocat } from "react-icons/io5";
import { IconType } from "react-icons/lib";


export const LoadingDots: React.FC<{ bg: string, Icon?: IconType, logo?: StaticImageData }> = ({ bg, Icon, logo }) => {
    return (
        <div className="flex ml-2">
            <div className="flex justify-center items-center relative h-16 w-16 rounded-full bg-white">
                {
                    logo ? <Image className="h-8 w-8 md:h-12 md:w-12  text-[#1A2238] rounded-full" src={logo} alt="chatbot logo" /> : Icon && <Icon className="h-8 w-8 md:h-12 md:w-12  text-chatbot  " />
                }
            </div>
            <div className={`flex items-center space-x-1.5 ml-5 text-black font-sans text-left p-6 text-[16px] rounded-xl w-fit bg-[${bg}]`}>
                <div className="w-2 h-2 rounded-full bg-white animate-bounce " />
                <div className=" w-2 h-2 rounded-full bg-white animate-bounce delay-100" />
                <div className="w-2 h-2 rounded-full bg-white animate-bounce delay-200" />
            </div>
        </div>
    );
};