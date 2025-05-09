import { v4 as uuidv4 } from "uuid";

export const products = [
    { id: uuidv4(), title: 'The Witcher 3: Wild Hunt', price: 39.99, description: 'The Witcher 3: Wild Hunt is a 2015 action role-playing game developed and published by CD Projekt. It is the sequel to the 2011 game The Witcher 2: Assassins of Kings and the third game in The Witcher video game series, played in an open world with a third-person perspective. The games follow the Witcher series of fantasy novels by Polish author Andrzej Sapkowski.', count: 100 },
    { id: uuidv4(), title: "Assassin's Creed Shadows", price: 69.99, description: "Assassin's Creed Shadows is a 2025 action-adventure game developed by Ubisoft Quebec and published by Ubisoft. The game is the fourteenth major installment in the Assassin's Creed series and the successor to Assassin's Creed Mirage.", count: 59 },
    { id: uuidv4(), title: 'The Last of Us', price: 59.99, description: 'The Last of Us is a 2013 action-adventure game developed by Naughty Dog and published by Sony Computer Entertainment. Players control Joel, a smuggler tasked with escorting a teenage girl, Ellie, across a post-apocalyptic United States.', count: 99 },
];