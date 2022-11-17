localStorage.setItem("leaderBoard", localStorage.getItem("leaderBoard") || '[]');
let leaderboard = JSON.parse(localStorage.getItem("leaderBoard"));

let gamemode = "score";
function selectGamemode(gm) {
     gamemode = gm;
     if(gm == "score") {
          document.querySelector(".gamemode-score").classList.add("active");
          document.querySelector(".gamemode-time").classList.remove("active");
     }
     else {
          document.querySelector(".gamemode-score").classList.remove("active");
          document.querySelector(".gamemode-time").classList.add("active");
     }

}

function genLeaderboard() {
     if(leaderboard.length == 0) {
          document.querySelector(".leaderboard-content").innerHTML = "No scores yet!";
          return;
     }
     document.querySelector(".leaderboard-content").innerHTML = leaderboard.map((score, index) => `
     <div class="leaderboard-item">
          <div class="leaderboard-item__rank">${index + 1}</div>
          <div class="leaderboard-item__name">${score.name}</div>
          <div class="leaderboard-item__score">${score.score}</div>
     </div>
     `).join("");
}
genLeaderboard();

document.querySelector('.inp-screen input').addEventListener("keypress", function(event) {
     if (event.key === "Enter") {
          event.preventDefault();
          document.querySelector('.inp-screen button').click();
     }
});
let name;
function finishGame(win, score) {
     document.body.className = "inp-screen";
     game.cleanup();
     game = null;
     
     if(!win) {
          if(gamemode == "time") {
               setTimeout(() => {
                    alert('Game Over! I mean you died. Very sad.');
               }, 500)
               return;
          }
          else {
               setTimeout(() => {
                    alert('Game Over! Your score is: ' + score);
               }, 500)
          }
     }
     if(gamemode == "time") {
          setTimeout(() => {
               alert('Your score is ' + score + ' lines in 2 minutes!');
          }, 500)
     }
     leaderboard.push({name, score});
     leaderboard.sort((a, b) => b.score - a.score);
     localStorage.setItem("leaderBoard", JSON.stringify(leaderboard));
     console.log(leaderboard);
     genLeaderboard();
}
let game;
function startGame() {
     document.body.className = "game-screen";
     name = document.querySelector("body div input").value;

     // Create a new game object
     game = new Tetris(finishGame, gamemode, (score) => {document.querySelector(".score").innerHTML = score;});
}
// let game = new Tetris("asdf", null);
// error case
// let rootLayout = new Layout(4, 4);
// rootLayout.addConstraints(new ProportionalConstraint(['x', 1, 2], ['y', 1, 2], 1));
// rootLayout.addConstraints(new ProportionalConstraint(['x', 0, 3], ['x', 0, 1], 0.2));
// rootLayout.addConstraints(new ProportionalConstraint(['x', 0, 3], ['x', 0, 2], 0.4));
// rootLayout.addConstraints(new ProportionalConstraint(['y', 0, 3], ['y', 0, 1], 0.3));
// rootLayout.addConstraints(new ProportionalConstraint(['y', 0, 3], ['y', 0, 2], 0.7));

//not implemented case 2
// let rootLayout = new Layout(4, 4);
// rootLayout.addConstraints(new FixedConstraint(['y', 2, 3], 100));
// rootLayout.addConstraints(new ProportionalConstraint(['y', 0, 1], ['y', 1, 2], 3));//probelem here
// rootLayout.addConstraints(new FixedConstraint(['x', 0, 1], 100));
// rootLayout.addConstraints(new ProportionalConstraint(['x', 1, 2], ['x', 2, 3], 3));
// rootLayout.addConstraints(new ProportionalConstraint(['x', 1, 2], ['y', 1, 2], 1));


// let rootLayout = new Layout(3, 2);
// rootLayout.addConstraints(new ProportionalConstraint(['x', 0, 1], ['x', 1, 2], 1));
// rootLayout.addConstraints(new ProportionalConstraint(['x', 0, 2], ['y', 0, 1], 1));


// let rootLayout = new Layout(6, 2);
// rootLayout.addConstraints(new ProportionalConstraint(['x', 0, 1], ['x', 4, 5], 1));// error if first
// rootLayout.addConstraints(new ProportionalConstraint(['x', 1, 4], ['x', 1, 2], 0.2952));
// rootLayout.addConstraints(new ProportionalConstraint(['x', 1, 4], ['x', 1, 3], 0.7048));
// rootLayout.addConstraints(new ProportionalConstraint(['y', 0, 1], ['x', 1, 4], 1.2207));
