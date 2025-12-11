export default function LandingPage() {
    return(
        <section
        className="relative h-screen w-full bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/assets/background/landingsitebg.png')", fontFamily: "IsoCore" }}
        >
            <div className="absolute top-6 left-6 text-white text-xl font-bold">
                WarMagic
            </div>
            <div className="absolute top-6 right-6 flex gap-4">
                <button className="px-8 py-3 text-white  backdrop-blur" style={{ backgroundColor: "#FFD080"}}>
                    Login
                </button>
                <button className="px-8 py-3 text-white backdrop-blur" style={{ backgroundColor: "#FFD080"}}>
                    Sign Up
                </button>
            </div>

            <div className="absolute left-10 top-1/3 text-white">
                <h1 className="text-9xl font-bold">WarMagic</h1>
                <p className="text-3xl mt-2">Placeholder description</p>
                <button className="mt-6 px-8 py-3 text-white" style={{ backgroundColor: "#FFD080"}}>Play</button>
            </div>
        </section>
    )
}