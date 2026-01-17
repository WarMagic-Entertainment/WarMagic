import Image from 'next/image';
import { getEnemyAsset } from '../constants';

interface EnemySpriteProps {
    currentEnemy: { name: string } | null;
    enemyState: "idle" | "attack" | "hit" | "dead";
}

export default function EnemySprite({ currentEnemy, enemyState }: EnemySpriteProps) {
    if (!currentEnemy) return null;

    return (
        <div className={`absolute bottom-10 right-60 w-[500px] h-[500px] transition-transform duration-200 ${enemyState === 'hit' ? 'brightness-150' : ''}`}>
            <Image
                key={`${currentEnemy.name}-${enemyState}`}
                src={getEnemyAsset(currentEnemy.name, enemyState)}
                alt={currentEnemy.name}
                fill
                className="object-contain object-bottom"
                unoptimized
                onError={(e) => {
                    e.currentTarget.src = "/assets/enemies/skeleton/skeleton-type1/Skeleton-Idle.gif";
                }}
            />
        </div>
    );
}
