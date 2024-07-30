import { PieceType, TeamType, Piece,  } from "../components/Chessboard/Chessboard";
import { enemyConfigs } from '../Units/Units';
import { projectileConfigs } from '../components/Projectile/Projectile';

export default class Referee {
    
    unitConfigArray = Object.values(enemyConfigs);
    projectileConfigArray = Object.values(projectileConfigs);

    projectileNameToIndexMap: Map<string, number>;

    constructor() {
        this.projectileNameToIndexMap = new Map<string, number>();

        // Populate the map with projectile names and their indices
        this.projectileConfigArray.forEach((config, index) => {
            this.projectileNameToIndexMap.set(config.name, index);
        });
    }

    directions = [
        { dx: -1, dy:  0 }, // left
        { dx:  1, dy:  0 }, // right
        { dx:  0, dy: -1 }, // top
        { dx:  0, dy:  1 }, // bottom
        { dx: -1, dy: -1 }, // top-left
        { dx:  1, dy: -1 }, // top-right
        { dx: -1, dy:  1 }, // bottom-left
        { dx:  1, dy:  1 }  // bottom-right
      ];
      getAttackResultCombat(AUnitConfigI: number, DUnitConfigI: number): number {
        let AttackDamage = 0;
        let AUnitData = this.unitConfigArray[AUnitConfigI];
        let DUnitData = this.unitConfigArray[DUnitConfigI];
    
        // Initial attack damage calculation
        AttackDamage = AUnitData.attack - DUnitData.defense;
    
        // Check for unit bonuses
        for (const bonus of AUnitData.bonus) {
            // Extract the key from the bonus object
            const key = Object.keys(bonus)[0];
    
            // Use type assertion to inform TypeScript that key is a valid key
            const bonusValue = (bonus as { [key: string]: number })[key];
    
            if (key === DUnitData.name) {
                AttackDamage += bonusValue;
            }
        }
       
        return Math.max(AttackDamage, 1); // Ensure that the damage is at least 1
    }
    
    tileIsOccupied(x: number, y: number, boardState: Piece[]): boolean {
        console.log("check tile occupied");
        const piece = boardState.find((p) => p.x === x && p.y === y);
        return !!piece;
    }

    isWithinBoardBounds(x: number, y: number): boolean {
        // Implement bounds checking based on your board size
        // For example, assuming a 10x10 board:
        return x >= 0 && x < 8 && y >= 0 && y < 8;
      }

    getAIUnitsThatCanAttack(boardState: Piece[]): Piece[] {
        // let OpponentPieces : Piece[] = [];
        const OpponentPieces = this.getAllPiecesOfTeam(TeamType.OPPONENT, boardState); // 'opponent' should be defined as needed

        const attackablePieces: Piece[] = [];

        // Iterate through each opponent piece
        for (const piece of OpponentPieces) {
            

            // Check surrounding tiles based on directions
            for (const direction of this.directions) {
                const newX = piece.x + direction.dx;
                const newY = piece.y + direction.dy;

                if (this.isTileOccupiedByEnemy(newX, newY, TeamType.OUR, boardState)) {
                    attackablePieces.push(piece);
                    break; // No need to check other directions if one is attackable
                }
            }
        }

        return attackablePieces;
    }


    isTileOccupiedByEnemy(x: number, y: number, MyTeam: TeamType, boardState: Piece[]): Piece | undefined {

        //untested
        console.log("check tile occupied");
        const piece = boardState.find((p) => p.x === x && p.y === y);

        if(piece?.team !== MyTeam) 
            return piece;
        else 
            return undefined;
        // return piece?.team !== TeamType.OUR; use to return boolean
        // if (piece) {
        //     return piece;
        // } else {
        //     return undefined;
        // }

    }

    getAllPiecesOfTeam(team: TeamType, boardState: Piece[]): Piece[] {
        return boardState.filter(piece => piece.team === team);
    }

    getClosestEnemy(selectedPiece: Piece, boardState: Piece[]): Piece | null {
    let closestEnemy: Piece | null = null;
    let minDistance = Infinity;

    boardState.forEach(piece => {
        if (piece.team !== selectedPiece.team) {
            // Calculate distance with y-coordinate inversion
            const distance = Math.abs(piece.x - selectedPiece.x) + Math.abs(( piece.y) - ( selectedPiece.y));
            if (distance < minDistance) {
                minDistance = distance;
                closestEnemy = piece;
            }
        }
    });

    return closestEnemy;
    }
    getPieceInTile(x: number, y: number, boardState: Piece[]): Piece | undefined {
        console.log("check tile occupied2");
        const piece = boardState.find((p) => p.x === x && p.y === y);
        // return piece?.team !== TeamType.OUR; use to return boolean
        if (piece) {
            return piece;
        } else {
            return undefined;
        }
    }

    removePiece(x: number, y: number, boardState: Piece[]): Piece[] {
        return boardState.filter(p => !(p.x === x && p.y === y));
    }
    
    isUnitInRange(PieceA: Piece, PieceB: Piece):boolean {
        const dx = Math.abs(PieceA.x - PieceB.x);
        const dy = Math.abs(PieceA.y - PieceB.y);
       const projConfig = this.getProjectileConfig(PieceA);
       let range = projConfig?.range ?? 1; 
        // Check if PieceB is exactly one tile away from PieceA
        return (dx <= range && dy <= range) && (dx + dy > 0); //improve it later for range / arrows.
    }


    getNextTilesTowardsTarget(currentX: number, currentY: number, targetX: number, targetY: number, steps: number, piece: Piece, boardState: Piece[]): { x: number, y: number } {
        let nextX = currentX;
        let nextY = currentY;
        // targetY = 7 - targetY; //this 
    
        function isTileOccupied(x: number, y: number): boolean {
            return boardState.some(piece => piece.x === x && piece.y === y);
        }
    
        while (steps > 0 && (nextX !== targetX || nextY !== targetY)) {
            let newX = nextX;
            let newY = nextY;
    
            if (nextX < targetX) {
                newX++;
            } else if (nextX > targetX) {
                newX--;
            }
    
            if (nextY < targetY) {
                newY++;
            } else if (nextY > targetY) {
                newY--;
            }
    
            if (isTileOccupied(newX, newY)) {
                if(this.isTileOccupiedByEnemy(newX, newY, piece.team,boardState )) {
                    nextX = newX;
                    nextY = newY;
                }
                break;
            }
    
            nextX = newX;
            nextY = newY;
            steps--;
        }
    
        return { x: nextX, y: nextY };
    }

    getUnitConfig(unitConfigIndex: number) {
       return this.unitConfigArray[unitConfigIndex];
    }

    getProjectileConfig(PieceA: Piece) {

        const configI = this.getUnitConfig(PieceA.unitConfigIndex);    
        const index = this.projectileNameToIndexMap.get(configI.projectile);
        return index !== undefined ? this.projectileConfigArray[index] : null;
 

    }



    isValidMove(px: number, py: number, x: number, y: number, type: PieceType, team: TeamType, boardState: Piece[], unitConfigIndex: number): boolean {
        console.log("Checking move - referee");
        console.log(`Previous location: (${px},${py})`);
        console.log(`Current location: (${x},${y})`);
        console.log(`Piece type: (${type})`);
        console.log(`Team type: (${team})`);

        const dx = Math.abs(px - x);
        const dy = Math.abs(py - y);

        let btileOccupied = this.tileIsOccupied(x, y, boardState);

        let unitData = this.unitConfigArray[unitConfigIndex];




        // if (type === PieceType.PAWN) {
        //     if (team === TeamType.OPPONENT) {
        //         if (dx <= 1 && dy <= 1) {
        //             if (!btileOccupied)
        //                 return true;
        //         }
        //     }
        // }

        // if (type === PieceType.KNIGHT) {
            // if (team === TeamType.OUR) {
                if (dx <= 1 && dy <= 1) {
                    if (!btileOccupied)
                        return true;
                }
            // }
        // }



        return false;
    }
}
