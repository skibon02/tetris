# Tetris!

Hello!
This is tetris in javascript with two modes:
- Score: Every 400 points (or 4 lines) decrease tick period by 0.9 times (gravity increase)
- Time: Try to clear as much lines as possible in 2 minutes.

Controls:
- A/Shift/C: hold
- D/F or X/Z or UP arrow: rotate piece
- S: 180 degrees rotation
- Left/Right arrows: move piece
- Down arrow: soft drop
- Space: hard drop

You can also change handling values: SDF, DAS and ARR.
For example, for setting ARR value to 20ms, open the console(F12) and enter the following comand:

```js
game.setARR(20);
```
# Structire 
There are 2 most important and big classes, located in files `layoutEngine.js` and  `tetris.js`

`layoutEngine.js` gives you an ability to construct adaptive grid layout (computation result is absolute values for every x and y line in pixels: resolvedX[i] and resolvedY[j]).
input data: fixed and proportial constraints between lines.

`tetris.js` contains the main tetris logic, rendering input and animations functionality.
