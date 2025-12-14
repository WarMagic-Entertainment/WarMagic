export default function ProfileIcon() {
    return(
        <section
        className="relative h-screen w-screen"
        style={{ fontFamily: "IsoCore" }}
        >
            <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat brightness-75"
                style={{ backgroundImage: "url('/assets/background/dracula_castle_4k_background.png')" }}
            ></div>
            <div className="absolute top-[45px] right-[100px] flex gap-8">
                <div className="relative group inline-block">
                    <img src="/assets/playerProfileIcon/dandadan.png" alt="userProfileIcon" className="w-[100px] h-[100px] rounded-[200px] cursor-pointer transition-all duration-300 relative z-30 block" />
                    <div className="absolute top-0 left-0 w-[100px] bg-[#202020] border border-[#747474] rounded-t-[200px] rounded-b-[200px] z-20 transition-all duration-300 overflow-hidden opacity-0 group-hover:opacity-100 hover:opacity-100 max-h-0 group-hover:max-h-[400px] hover:max-h-[400px] pointer-events-none group-hover:pointer-events-auto hover:pointer-events-auto" style={{ boxShadow: '0px 8px 10px 4px rgba(0, 0, 0, 1)'}}>
                        <div className="p-2 pt-[115px] text-white flex flex-col items-center gap-5 h-[350px] rounded-[200px]">
                            <div className="relative flex items-center justify-center group/icon">
                                <div className="absolute w-16 h-16 bg-[#2D2D2D] rounded-full opacity-0 group-hover/icon:opacity-100 transition-opacity duration-300"></div>
                                <img src="/assets/menu_icons/cards-fortune-future-moon-star-svgrepo-com.svg" alt="" className="w-13 h-13 relative z-10" style={{ filter: 'brightness(0) saturate(100%) invert(82%) sepia(25%) saturate(1500%) hue-rotate(0deg) brightness(1.1)' }} />
                            </div>
                            <div className="relative flex items-center justify-center group/icon">
                                <div className="absolute w-16 h-16 bg-[#2D2D2D] rounded-full opacity-0 group-hover/icon:opacity-100 transition-opacity duration-300"></div>
                                <img src="/assets/menu_icons/settings-svgrepo-com.svg" alt="" className="w-13 h-13 relative z-10" style={{ filter: 'brightness(0) saturate(100%) invert(82%) sepia(25%) saturate(1500%) hue-rotate(0deg) brightness(1.1)' }} />
                            </div>
                            <div className="relative flex items-center justify-center group/icon">
                                <div className="absolute w-16 h-16 bg-[#2D2D2D] rounded-full opacity-0 group-hover/icon:opacity-100 transition-opacity duration-300"></div>
                                <img src="/assets/menu_icons/sorcerer-hat-svgrepo-com.svg" alt="" className="w-13 h-13 relative z-10" style={{ filter: 'brightness(0) saturate(100%) invert(82%) sepia(25%) saturate(1500%) hue-rotate(0deg) brightness(1.1)' }} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}