;(function() {

	console.log('hi!')
	
	var Game = function(canvasId) {
		var canvas = document.getElementById(canvasId)
		var screen = canvas.getContext('2d')
		var gameSize =  { x: canvas.width, y: canvas.height	}
	
		this.bodies = []

		this.bodies = this.bodies.concat(new Player(this, gameSize))
		this.bodies = this.bodies.concat(createInvaders(this))

		var self = this

		var tick = function() {
			self.update()
			self.draw(screen, gameSize)
			requestAnimationFrame(tick)
		}

		tick()
	}


	Game.prototype = {

	    // **update()** runs the main game logic.
	    update: function() {
	      var self = this;

	      // `notCollidingWithAnything` returns true if passed body
	      // is not colliding with anything.
	      var notCollidingWithAnything = function(b1) {
	        return self.bodies.filter(function(b2) { return colliding(b1, b2); }).length === 0;
	      };

	      // Throw away bodies that are colliding with something. They
	      // will never be updated or draw again.
	      this.bodies = this.bodies.filter(notCollidingWithAnything);

	      // Call update on every body.
	      for (var i = 0; i < this.bodies.length; i++) {
	        this.bodies[i].update();
	      }
	    },

	    // **draw()** draws the game.
	    draw: function(screen, gameSize) {
	      // Clear away the drawing from the previous tick.
	      screen.clearRect(0, 0, gameSize.x, gameSize.y);

	      // Draw each body as a rectangle.
	      for (var i = 0; i < this.bodies.length; i++) {
	        drawRect(screen, this.bodies[i]);
	      }
	    },

	    // **invadersBelow()** returns true if `invader` is directly
	    // above at least one other invader.
	    invadersBelow: function(invader) {
	      // If filtered array is not empty, there are invaders below.
	      return this.bodies.filter(function(b) {
	        // Keep `b` if it is an invader, if it is in the same column
	        // as `invader`, and if it is somewhere below `invader`.
	        return b instanceof Invader &&
	          Math.abs(invader.center.x - b.center.x) < b.size.x &&
	          b.center.y > invader.center.y;
	      }).length > 0;
	    },

	    // **addBody()** adds a body to the bodies array.
	    addBody: function(body) {
	      this.bodies.push(body);
	    }
	 };

	
	var drawRect = function(screen, body) {
		screen.fillRect(body.center.x - body.size.x / 2,
						body.center.y - body.size.y / 2,
						body.size.x, body.size. y)

	}

	var Keyboarder = function(){
		var keyState = {}

		window.onkeydown = function(e) {
			keyState[e.keyCode] = true
		}

		window.onkeyup = function(e) {
			keyState[e.keyCode] = false
		}

		this.isDown = function(keyCode) {
			return keyState[keyCode] === true
		}

		this.KEYS = { LEFT: 37, RIGHT: 39, SPACE: 32 }
	}

	// PLAYER CONSTRUCTOR
	var Player = function(game, gameSize) {
		this.game = game
		this.size = { x: 15, y: 15 }
		this.center = { x: gameSize.x/2, y: gameSize.y/2 - this.size.x}
		this.keyboarder = new Keyboarder()
	}

	Player.prototype = {
		update: function() {
			if(this.keyboarder.isDown(this.keyboarder.KEYS.LEFT)) {
				this.center.x -= 2 
			}

			else if(this.keyboarder.isDown(this.keyboarder.KEYS.RIGHT)) {
				this.center.x += 2 
			}

			if(this.keyboarder.isDown(this.keyboarder.KEYS.SPACE)) {
				var bullet = new Bullet(
					{ x: this.center.x, y: this.center.y - this.size.x / 2},
					{ x: 0, y: -6 }

				)

				console.log('bullet fired by player!')

				this.game.addBody(bullet)
			}

		}
	}


	// **new Invader()** creates an invader.
	var Invader = function(game, center) {
	    this.game = game;
	    this.center = center;
	    this.size = { x: 15, y: 15 };

	    // Invaders patrol from left to right and back again.
	    // `this.patrolX` records the current (relative) position of the
	    // invader in their patrol.  It starts at 0, increases to 40, then
	    // decreases to 0, and so forth.
	    this.patrolX = 0;

	    // The x speed of the invader.  A positive value moves the invader
	    // right. A negative value moves it left.
	    this.speedX = 0.3;
	 }


	Invader.prototype = {

	    // **update()** updates the state of the invader for a single tick.
	    update: function() {

	      // If the invader is outside the bounds of their patrol...
	      if (this.patrolX < 0 || this.patrolX > 30) {

	        // ... reverse direction of movement.
	        this.speedX = -this.speedX;
	      }

	      // If coin flip comes up and no friends below in this
	      // invader's column...
	      if (Math.random() > 0.995 &&
	          !this.game.invadersBelow(this)) {

	        // ... create a bullet just below the invader that will move
	        // downward...
	        var bullet = new Bullet({ x: this.center.x, y: this.center.y + this.size.y / 2 },
	                                { x: Math.random() - 0.5, y: 2 });

	        // ... and add the bullet to the game.
	        this.game.addBody(bullet);
	      }

	      // Move according to current x speed.
	      this.center.x += this.speedX;

	      // Update variable that keeps track of current position in patrol.
	      this.patrolX += this.speedX;
	    }
	 }


	var createInvaders = function(game) {
		var invaders = []

		for (var i = 0; i < 24; i++) {
			var x = 30 + (i % 8) * 30
			var y = 30 + (i % 3) * 30
			invaders.push(new Invader(game, {x: x, y: y}))

		}

		return invaders

	}


	// BULLET CONSTRUCTOR

	var Bullet = function(center, velocity) {
	    this.center = center;
	    this.size = { x: 3, y: 3 };
	    this.velocity = velocity;
	}

	Bullet.prototype = {

	    // **update()** updates the state of the bullet for a single tick.
	    update: function() {

	      // Add velocity to center to move bullet.
	      this.center.x += this.velocity.x;
	      this.center.y += this.velocity.y;
	    }
	}

	var colliding = function(b1, b2) {
	    return !(
	      b1 === b2 ||
	        b1.center.x + b1.size.x / 2 < b2.center.x - b2.size.x / 2 ||
	        b1.center.y + b1.size.y / 2 < b2.center.y - b2.size.y / 2 ||
	        b1.center.x - b1.size.x / 2 > b2.center.x + b2.size.x / 2 ||
	        b1.center.y - b1.size.y / 2 > b2.center.y + b2.size.y / 2
	    )
	}


	window.onload = function() {
		new Game('screen')
	}

})();