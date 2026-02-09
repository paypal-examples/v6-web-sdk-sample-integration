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
    icon: string;
    image: { src: string; alt: string };
  }
> = {
  "1blwyeo8": {
    id: 1,
    name: "World Cup Ball",
    description: "Official World Cup soccer ball",
    icon: "⚽️",
    image: { src: soccerBallImage, alt: "World Cup Soccer Ball" },
  },
  i5b1g92y: {
    id: 2,
    name: "Professional Basketball",
    description: "Professional grade basketball",
    icon: "🏀",
    image: { src: basketballImage, alt: "Professional Basketball" },
  },
  "3xk9m4n2": {
    id: 3,
    name: "Official Baseball",
    description: "Official league baseball",
    icon: "⚾️",
    image: { src: baseballImage, alt: "Official Baseball" },
  },
  "7pq2r5t8": {
    id: 4,
    name: "Hockey Puck",
    description: "Official NHL hockey puck",
    icon: "🏒",
    image: { src: hockeyPuckImage, alt: "Hockey Puck" },
  },
};
