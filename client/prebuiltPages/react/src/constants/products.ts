import soccerBallImage from "../images/world-cup.jpg";
import basketballImage from "../images/basket-ball.jpeg";
import baseballImage from "../images/base-ball.jpeg";
import hockeyPuckImage from "../images/hockey-puck.jpeg";

export const PRODUCT_DATA: Record<
  string,
  {
    id: number;
    name: string;
    description: string;
    category: string;
    stock: number;
    icon: string;
    image: { src: string; alt: string };
  }
> = {
  "1blwyeo8": {
    id: 1,
    name: "World Cup Ball",
    description: "Official World Cup soccer ball",
    category: "PHYSICAL_GOODS",
    stock: 10,
    icon: "⚽️",
    image: { src: soccerBallImage, alt: "World Cup Soccer Ball" },
  },
  i5b1g92y: {
    id: 2,
    name: "Professional Basketball",
    description: "Professional grade basketball",
    category: "PHYSICAL_GOODS",
    stock: 15,
    icon: "🏀",
    image: { src: basketballImage, alt: "Professional Basketball" },
  },
  "3xk9m4n2": {
    id: 3,
    name: "Official Baseball",
    description: "Official league baseball",
    category: "PHYSICAL_GOODS",
    stock: 20,
    icon: "⚾️",
    image: { src: baseballImage, alt: "Official Baseball" },
  },
  "7pq2r5t8": {
    id: 4,
    name: "Hockey Puck",
    description: "Official NHL hockey puck",
    category: "PHYSICAL_GOODS",
    stock: 25,
    icon: "🏒",
    image: { src: hockeyPuckImage, alt: "Hockey Puck" },
  },
};
