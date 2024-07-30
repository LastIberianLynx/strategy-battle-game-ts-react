import React, { useRef, useState, useEffect } from 'react';
import Tile from '../Tile/Tile';
import BlackSquareComponent from '../BlackSquare/BlackSquare';
import TerrainFeatureComponent, { terrainConfigs } from '../TerrainFeature/TerrainFeature';
import ProjectileComponent, { projectileConfigs } from '../Projectile/Projectile';
import './Chessboard.css';
import TextMessage from '../TextMessage/TextMessage'; // Import the TextMessage component
import Referee from '../../referee/Referee';
import { enemyConfigs } from '../../Units/Units';
import Projectile from '../Projectile/Projectile';

const verticalAxis = ["1", "2", "3", "4", "5", "6", "7", "8"];
const horizontalAxis = ["a", "b", "c", "d", "e", "f", "g", "h"];

export interface Piece {
    image: string;
    x: number;
    y: number;
    type: PieceType;
    team: TeamType;
    health: number;
    unitConfigIndex: number;
    curMoves: number;
}

export interface BlackSquare {
    x: number;
    y: number;
}

export interface TerrainFeature {
    x: number;
    y: number;
    backgroundImage: string;
}

export interface Projectile {
    x: number;
    y: number;
    xdest: number;
    ydest: number;
    backgroundImage: string;

}

export enum PieceType {
    PAWN,
    BISHOP,
    KNIGHT,
    ROOK,
    QUEEN,
    KING
}

export enum TeamType {
    OPPONENT,
    OUR
}

const enemyArray = Object.values(enemyConfigs);

const initialBoardState: Piece[] = [];
for (let i = 0; i < 8; i++) {
    const randomIndex = Math.floor(Math.random() * enemyArray.length);
    const EnemyObj = enemyArray[randomIndex];
    initialBoardState.push({ image: "assets/images/" + EnemyObj.spriteSheet + ".png", x: 7, y: i, type: PieceType.PAWN, team: TeamType.OPPONENT, health: 80, unitConfigIndex: randomIndex, curMoves: EnemyObj.moves });
}

// {
// const randomIndex = Math.floor(Math.random() * enemyArray.length);
// const EnemyObj = enemyArray[randomIndex];
// initialBoardState.push({ image: "assets/images/" + EnemyObj.spriteSheet + ".png", x: 6, y: 0, type: PieceType.PAWN, team: TeamType.OPPONENT, health: 80, unitConfigIndex: randomIndex });
// }

for (let i = 0; i < 8; i++) {
    const randomIndex = Math.floor(Math.random() * enemyArray.length);
    const EnemyObj = enemyArray[randomIndex];
    initialBoardState.push({ image: "assets/images/" + EnemyObj.spriteSheet + ".png", x: 0, y: i, type: PieceType.KNIGHT, team: TeamType.OUR, health: 50, unitConfigIndex: randomIndex, curMoves: EnemyObj.moves  });
}

const terrainArray = Object.values(terrainConfigs);
const initialTerrainFeatures: TerrainFeature[] = [];

for(let i = 0; i < 8; i++) {
    const randomIndex = Math.floor(Math.random() * terrainArray.length);
    const terrainObj = terrainArray[randomIndex];
    initialTerrainFeatures.push({ x: Math.floor(Math.random() * 8), y: Math.floor(Math.random() * 8), backgroundImage: terrainObj.spriteSheet });
}

const initialBlackSquares: BlackSquare[] = [];

for (let i = 0; i < 8; i++) {
    initialBlackSquares.push({ x: Math.floor(Math.random() * 8), y: Math.floor(Math.random() * 8) });
}


const initialProjectiles: Projectile[] = []; //for testing
const projectileArray = Object.values(projectileConfigs);


for (let i = 0; i < 8; i++) {
    const randomIndex = Math.floor(Math.random() * terrainArray.length);
    const projectileObj = projectileArray[randomIndex];
    const x1 = Math.floor(Math.random() * 8);
    const y1 = Math.floor(Math.random() * 8);
    initialProjectiles.push({ x: x1, y: y1, xdest:x1+3, ydest:y1,  backgroundImage: projectileObj.spriteSheet });
}


export default function Chessboard() {
    const [selectedPiece, setSelectedPiece] = useState<Piece | null>(null);
    const [pieces, setPieces] = useState<Piece[]>(initialBoardState);
    const [blackSquares, setBlackSquares] = useState<BlackSquare[]>(initialBlackSquares);
    const [terrainFeatures, setTerrainFeatures] = useState<TerrainFeature[]>(initialTerrainFeatures);
    const [projectiles, setProjectiles] = useState<Projectile[]>(initialProjectiles);
    const [textMessages, setTextMessages] = useState<{ id: number; text: string; x: number; y: number; color: string }[]>([]);
    const [currentTurn, setCurrentTurn] = useState<TeamType>(TeamType.OUR);
    const [movesLeft, setMovesLeft] = useState<number>(3);

    const chessboardRef = useRef<HTMLDivElement>(null);
    const referee = new Referee();
    let nextMessageId = useRef(0);

    const currentTurnRef = useRef(currentTurn);
    useEffect(() => {
        currentTurnRef.current = currentTurn;
    }, [currentTurn]); //this checks the actual state. whereas the other way isnt working.

    useEffect(() => {
        handleProjectiles(); // Start handling projectiles once on mount
    }, []); // Empty dependency array ensures it runs only once

    useEffect(() => {
        if (currentTurn === TeamType.OPPONENT) {
            makeAIMoves();
        }
    }, [currentTurn]);

    useEffect(() => {
        if (movesLeft === 0) {
            restoreUnitMoves();
            setCurrentTurn(prevTurn => prevTurn === TeamType.OUR ? TeamType.OPPONENT : TeamType.OUR);
            setMovesLeft(3);
        }
    }, [movesLeft]);

    useEffect(() => {
        const handleKeyPress = (event: KeyboardEvent) => {
            if (event.code === "Space" && currentTurnRef.current === TeamType.OUR) {
                handleEndTurn();
            }
        };

        document.addEventListener("keydown", handleKeyPress);

        return () => {
            document.removeEventListener("keydown", handleKeyPress);
        };
    }, []);


    function selectPiece(x: number, y: number) {
        
        if (currentTurn !== TeamType.OUR) return; // Prevent selection during opponent's turn
        const piece = pieces.find(p => p.x === x && p.y === y);

        if (piece) {
            if (selectedPiece && (selectedPiece.x !== x || selectedPiece.y !== y)) {
                setSelectedPiece(piece);
            } else if (selectedPiece && selectedPiece.x === x && selectedPiece.y === y) {
                setSelectedPiece(null);
            } else {
                setSelectedPiece(piece);
            }
        } else {
            if (selectedPiece) {
                setSelectedPiece(null);
            }
        }
    }

    function movePieceTo(x: number, y: number) {
        if (selectedPiece && selectedPiece.team === TeamType.OUR && currentTurn === TeamType.OUR) { // Check if it's player's turn and if the selected piece belongs to the player
            // const closestPiece = referee.getClosestEnemy(selectedPiece, pieces);
            // if(closestPiece)
            // addTextMessage("Closest Piece", closestPiece.x, closestPiece.y);
            if(selectedPiece.curMoves < 1) {
                addTextMessage("Out of moves!", x, 7 - y, "red");
                return;
            }
            
            const validMove = referee.isValidMove(selectedPiece.x, selectedPiece.y, x, y, selectedPiece.type, selectedPiece.team, pieces, selectedPiece.unitConfigIndex);
            if (validMove) {
                setPieces(pieces.map(p =>
                    p.x === selectedPiece.x && p.y === selectedPiece.y
                        ? { ...p, x, y, curMoves: selectedPiece.curMoves - 1 }
                        : p
                ));
                addTextMessage("Moving!", x, 7 - y, "blue");
                setSelectedPiece(null);
                handleEndOfMove();
            } else {
                const bEnemyOccupied = referee.getPieceInTile(x, y, pieces);
                if (bEnemyOccupied && bEnemyOccupied.team !== TeamType.OUR) {
                  
                    // const attackDamage = referee.getAttackResultCombat(selectedPiece.unitConfigIndex, bEnemyOccupied.unitConfigIndex);
                    // addTextMessage("Pow ! " + attackDamage, x, 7.20 - y);
                    // bEnemyOccupied.health -= attackDamage;

                    // if (bEnemyOccupied.health <= 0) {
                    //     const newPieces = referee.removePiece(x, y, pieces);

                    //     setPieces(newPieces.map(p =>
                    //         p.x === selectedPiece.x && p.y === selectedPiece.y
                    //             ? { ...p, health: p.health }
                    //             : p
                    //     ));
                    // }
                    if(referee.isUnitInRange(selectedPiece,bEnemyOccupied)) {
                        attack(selectedPiece, bEnemyOccupied);
                        selectedPiece.curMoves =-1;
                        handleEndOfMove();
                    }
                }
                setSelectedPiece(null);
               
            }
        }
    }

    function attack(AttackPiece: Piece, DefendPiece: Piece) {
        const projectileAttack = referee.getProjectileConfig(AttackPiece);
        // if(projectileAttack && projectileAttack?.name != "None")
        // {
        //         // Create a new projectile object
        //         const newProjectile = {
        //             x: AttackPiece.x,
        //             y: 7-AttackPiece.y,
        //             xdest: DefendPiece.x, // Adjust destination as needed
        //             ydest: 7-DefendPiece.y,
        //             backgroundImage: projectileAttack.spriteSheet
        //         };
        
        //         // Add the new projectile to the initialProjectiles array
        //         // initialProjectiles.push(newProjectile);
        
        //         // Update the state with new projectiles
        //         setProjectiles(prevProjectiles => [...prevProjectiles, newProjectile]);
        //     addTextMessage("Skrrrt", DefendPiece.x, 7.20 - DefendPiece.y);
        //     return;
        // }

        const attackDamage = referee.getAttackResultCombat(AttackPiece.unitConfigIndex, DefendPiece.unitConfigIndex);
        
        const attackMessages = [
            `POWwW !  ${attackDamage}`,
            `KaBonG !  ${attackDamage}`,
            `BaM pOW !  ${attackDamage}`
        ];
        
        // Select a random message from the array
        const randomMessage = attackMessages[Math.floor(Math.random() * attackMessages.length)];
        addTextMessage(randomMessage, DefendPiece.x, 7.20 - DefendPiece.y, 'red');
        
        DefendPiece.health -= attackDamage;
        // if (DefendPiece.health <= 0) {
        //     const newPieces = referee.removePiece(DefendPiece.x, DefendPiece.y, pieces);
        //     setPieces(newPieces);
        // }
        if (DefendPiece.health <= 0) {
            const newPieces = referee.removePiece(DefendPiece.x, DefendPiece.y, pieces);

            setPieces(newPieces.map(p =>
                p.x === AttackPiece.x && p.y === AttackPiece.y
                    ? { ...p, health: p.health }
                    : p
            ));
        }

    }

    function handleProjectiles() {
        const intervalId = setInterval(() => {
            if(initialProjectiles.length < 1)
                return;
            setProjectiles(prevProjectiles => {
                let updatedProjectiles = prevProjectiles.map(proj => {
                    const dx = proj.xdest - proj.x;
                    const dy = proj.ydest - proj.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
    
                    // Determine the speed of the projectile
                    const speed = 0.5; // Adjust the speed as needed
                    if (distance < speed) {
                        // Projectile has reached the destination
                        //here we deliver damage to enemy unit.
                        return null;
                    }
    
                    // Calculate the unit vector towards the destination
                    const unitX = dx / distance;
                    const unitY = dy / distance;
    
                    // Move the projectile
                    return {
                        ...proj,
                        x: proj.x + unitX * speed,
                        y: proj.y + unitY * speed
                    };
                }).filter((proj): proj is Projectile => proj !== null); // Type assertion to filter out nulls
    
                // Clear the interval if no projectiles are left
                // if (updatedProjectiles.length === 0) {
                //     clearInterval(intervalId);
                // }
    
                return updatedProjectiles;
            });
        }, 250); // Adjust the interval time as needed
    }

    function handleEndOfMove() {
        setMovesLeft(prevMoves => prevMoves - 1);
    }

    function handleTileClick(x: number, y: number) {
        selectPiece(x, y);
    }

    function handleTileContextMenu(e: React.MouseEvent, x: number, y: number) {
        e.preventDefault();
        movePieceTo(x, y);
        
    }

    function addTextMessage(text: string, x: number, y: number, color: string = 'white') {
        const id = nextMessageId.current++;
        setTextMessages((prevMessages) => [
            ...prevMessages,
            { id, text, x, y, color },
        ]);
    }

    function handleTextMessageEnd(id: number) {
        setTextMessages((prevMessages) =>
            prevMessages.filter((message) => message.id !== id)
        );
    }

    function restoreUnitMoves() {
        setPieces(pieces.map(piece => {
            // Fetch the unit configuration for the current piece
            const unitConfig = referee.getUnitConfig(piece.unitConfigIndex);
            
            // Return the updated piece with the moves restored from unitConfig
            return {
                ...piece,
                curMoves: unitConfig.moves
            };
        }));

    }
    function handleEndTurn() {
        if(currentTurn === TeamType.OUR)
        setMovesLeft(0);
        
    }

    function makeAIMoves() {
        //should do an utility AI to analyze attack and defense of human units. 
        //And move each unit according to strenght and weakness, and by best utility priority.
        // as is i leave it as a random move.
        //but it should be at least, an forward general advance like Total War.
        let aiMoves = 3;
        let attemptsToMove = 0; //this is to prevent AI from getting stuck.


        const interval = setInterval(() => {
            attemptsToMove++;
            if(attemptsToMove > 10)
                aiMoves = 0;
            if (aiMoves > 0) {
                let opponentPieces = pieces.filter(p => p.team === TeamType.OPPONENT);
                if(!opponentPieces.length)
                    addTextMessage("You WON the battle.", 3, 3, 'orange');

                opponentPieces = opponentPieces.filter(p => p.curMoves > 0);
                if (opponentPieces.length > 0) {
                    let piecesCanAttack = referee.getAIUnitsThatCanAttack(opponentPieces);

                    if(piecesCanAttack.length > 0) {
                        opponentPieces = piecesCanAttack;
                    }
                        const randomPieceIndex = Math.floor(Math.random() * opponentPieces.length);
                        const piece = opponentPieces[randomPieceIndex];
                        //instead of getting a random piece, i need to prioritize units that are close to enemies for combat moves.

                        const closestEnemyPiece = referee.getClosestEnemy(piece, pieces);
                        if(closestEnemyPiece) {
                        // addTextMessage("Closest Piece", closestEnemyPiece.x, 7-closestEnemyPiece.y); //debug only
                        const unitConfig = referee.getUnitConfig(piece.unitConfigIndex);

                        
                        // const validMoves: { x: number, y: number }[] = getValidMoves(piece); // Define the type of validMoves
                        // if (validMoves.length > 0) {
                            // const randomMoveIndex = Math.floor(Math.random() * validMoves.length);
                            // const move = validMoves[randomMoveIndex];
                            // setPieces(prevPieces => prevPieces.map(p =>
                            //     p === piece ? { ...p, x: move.x, y: move.y } : p
                            // ));
                        // }
                        const nextTile = referee.getNextTilesTowardsTarget(piece.x, piece.y, closestEnemyPiece.x, closestEnemyPiece.y, 1, piece ,pieces);

                        //there's an issue with this ^. 
                        //its not getting the tiles right.
                        //we need to make this one work properly ^
                        
                        const enemyFound = referee.isTileOccupiedByEnemy(nextTile.x, nextTile.y, piece.team, pieces);
                        //should also prevent move if it is occupied by a friendly.

                        if(enemyFound) {

                            attack(piece, enemyFound);
                            aiMoves--;
                            piece.curMoves--;

                        } else {

                            if(!referee.tileIsOccupied(nextTile.x, nextTile.y, pieces)) {
                            //this will prevent piece overlapping.
                                // piece.x = nextTile.x;
                                // piece.y = nextTile.y;
                                    setPieces(prevPieces => prevPieces.map(p =>
                                        p === piece ? { ...p, x: nextTile.x, y: nextTile.y } : p
                                    ));
                                    // setPieces(pieces);
                            }
                            piece.curMoves--;
                            aiMoves--;
                        }
                        
                        // const validMoves: { x: number, y: number }[] = getValidMoves(piece); // Define the type of validMoves
                        // if (validMoves.length > 0) {
                        //     const randomMoveIndex = Math.floor(Math.random() * validMoves.length);
                        //     const move = validMoves[randomMoveIndex];
                        //     setPieces(prevPieces => prevPieces.map(p =>
                        //         p === piece ? { ...p, x: move.x, y: move.y } : p
                        //     ));
                        // }
                     }
                    
                } else {
                    //game over enemy won, no human units left.
                    addTextMessage("No more moves.", 4, 4, 'red');
                    aiMoves = 0;
                    //skip turn.
                }
               
            } else {
                clearInterval(interval);
                setCurrentTurn(TeamType.OUR);
            }
        }, 500); // Adjust the interval time as needed
    }

    function getValidMoves(piece: Piece): { x: number, y: number }[] {
        //replaced by getting closest unit.
        //AI
        //this is just a randomizing movement function
        //we need the other function to work, so we move consistently towards my units.

        const validMoves: { x: number, y: number }[] = [];
        // Logic to calculate valid moves for the piece
        // For simplicity, here we assume the piece can move to any empty adjacent square

        //should take into account Piece Move so i need configs here.
        // get the move of the piece and multiply it with the values below v

        const directions = [
            { x: -1, y: 0 },
            { x: 1, y: 0 },
            { x: 0, y: -1 },
            { x: 0, y: 1 }
        ];

        directions.forEach(direction => {
            const newX = piece.x + direction.x;
            const newY = piece.y + direction.y;
            if (newX >= 0 && newX < 8 && newY >= 0 && newY < 8) {
                const occupied = pieces.some(p => p.x === newX && p.y === newY);
               
                if (!occupied) {
                    validMoves.push({ x: newX, y: newY });

                } else {
                    const enemyPiece = referee.isTileOccupiedByEnemy(newX,newY, piece.team, pieces);
                    if(enemyPiece)
                        validMoves.push({ x: newX, y: newY }); 
                }
            }
        });

        return validMoves;
    }

    let board = [];

    for (let j = verticalAxis.length - 1; j >= 0; j--) {
        for (let i = 0; i < horizontalAxis.length; i++) {
            const number = j + i + 2;
            let image = "";
            let health: number | undefined;
            let flip = true;
            let isOpponent = false;

            pieces.forEach(p => {
                if (p.x === i && p.y === j) {
                    image = p.image;
                    health = p.health;
                    if (p.team === TeamType.OUR) {
                        flip = false;
                    }
                    if (p.team === TeamType.OPPONENT) {
                        isOpponent = true;
                    }
                }
            });

            board.push(
                <Tile
                    key={`${j},${i}`}
                    image={image}
                    number={number}
                    onClick={() => handleTileClick(i, j)}
                    onContextMenu={(e) => handleTileContextMenu(e, i, j)}
                    pieceHighlight={selectedPiece ? selectedPiece.x === i && selectedPiece.y === j : false}
                    health={health}
                    flip={flip}
                    isOpponent={isOpponent}
                />
            );
        }
    }

    return (
        <div id="chessboard" ref={chessboardRef}>
            {board}
            {blackSquares.map((feature, index) => (
                <BlackSquareComponent key={index} x={feature.x} y={feature.y} onContextMenu={(e) => handleTileContextMenu(e, feature.x, 7 - feature.y)}/>
            ))}
            {terrainFeatures.map((feature, index) => (
                <TerrainFeatureComponent key={index} x={feature.x} y={feature.y} backgroundImage={feature.backgroundImage} onContextMenu={(e) => handleTileContextMenu(e, feature.x, 7 - feature.y)} />
            ))}
            {projectiles.map((feature, index) => (
                <ProjectileComponent key={index} x={feature.x} y={feature.y} backgroundImage={feature.backgroundImage} />
            ))}
            {textMessages.map((message) => (
                <TextMessage
                    key={message.id}
                    text={message.text}
                    x={message.x}
                    y={message.y}
                    color={message.color} // Pass color here
                    onAnimationEnd={() => handleTextMessageEnd(message.id)}

                />
            ))}
        </div>
    );
}
