import Image from 'next/image';

interface PlayerSpriteProps {
    playerState: "idle" | "attack" | "hit" | "dead" | "deadAnim";
    setPlayerState: (s: "idle" | "attack" | "hit" | "dead" | "deadAnim") => void;
}

export default function PlayerSprite({ playerState, setPlayerState }: PlayerSpriteProps) {
    let src = "/assets/player/player1/player_ready.gif";
    if (playerState === "deadAnim") src = "/assets/player/player1/gelorbi_dead.mp4";
    if (playerState === "dead") src = "/assets/player/player1/gelorbi_dead.png";
    if (playerState === "attack") src = "/assets/player/player1/gelorbi_attack.mp4";
    if (playerState === "hit") src = "/assets/player/player1/gelorbi_hit.mp4";

    if (playerState === "deadAnim" || playerState === "attack" || playerState === "hit") {
        return (
            <video
                key={playerState}
                src={src}
                autoPlay
                muted
                playsInline
                className="absolute bottom-10 left-30 w-[700px] h-[700px] object-contain object-bottom"
                onEnded={() => {
                    if (playerState === "deadAnim") setPlayerState("dead");
                    else setPlayerState("idle");
                }}
            />
        );
    }

    return (
        <Image
            src={src}
            alt="player"
            width={700}
            height={700}
            className="absolute bottom-10 left-30 object-contain object-bottom"
        />
    );
}
