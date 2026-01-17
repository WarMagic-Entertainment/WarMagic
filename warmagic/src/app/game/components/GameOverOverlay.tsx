import { useRouter } from "next/navigation";

export default function GameOverOverlay() {
    const router = useRouter();

    return (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-black/90 z-50">
            <h1 className="text-8xl font-bold text-red-600 mb-8 animate-pulse">
                GAME OVER
            </h1>
            <button
                onClick={() => router.push('/lobby')}
                className="bg-[var(--custom-yellow)] text-black font-bold p-5 px-12 text-2xl rounded hover:scale-110 transition-transform"
            >
                Return to Lobby
            </button>
        </div>
    );
}
