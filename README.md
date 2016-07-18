
# Arcade Game Clone

This project represent classic arcade game clone for [Udacity Front-End Nanodegree](https://www.udacity.com/course/front-end-web-developer-nanodegree--nd001) program. 
It is a simple browser game based on JavaScript and HTML Canvas.

## Requirements

Game requires one of modern browsers:

- Chrome
- Opera
- Firefox
- Edge
- InternetExplorer 10+

To launch the game just open **index.html** in one of supported browsers.

## Gameplay

The aim of the game is to get the most scores. You get score points when your character reaches the water. The higher the level, the more points you get. If there is enough space on the stage, new stone row is added every 5 levels as additional difficulty increase.

There are **Gems** appearing on the stone road sometimes. Collecting gems doubles your current scores.

You start with **3 Health Points** (HP, indicates with hearts icons). If **Enemy** touches the you, you *lose* **1HP** and back to the grass row.
Every 5 levels you *get* **1HP** up to the maximum of **5HP**.

You start with **3 Health Points** (HP, indicated by hearts icons). If **Enemy** touches the you, you *lose* **1HP** and go back to the grass row. Every 5 levels you *get* **1HP** up to the maximum of **5HP**.


## Customization

Default canvas size for the game is **505x600**. With those parameters 5x6 game field is created.
But you can change stage size to get another game experience. 
In order to do this, you have to change `CANVAS_WIDTH`, `CANVAS_HEIGHT` and `INITIAL_DIFFICULTY` constants in the end of **js/app.js** file.
You may try parameters like this:
- **303, 400, 50** — very small game area (3x3) with a fast enemies
- **303, 800, 1** — long corridor challenge (3x8)
- **1010, 900, 30** — huge 10x9 game area

## Known issues and bugs

- In some browsers switching to another tab for a some period of time and then switching back to game tab may cause all enemies to start their movement simultaneously from the left side of the screen.

## License
This project is released under the [MIT License](https://opensource.org/licenses/MIT). Copyright (c) 2016 Anton Matrosov.