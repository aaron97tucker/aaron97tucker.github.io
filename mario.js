<
<head>
    <title>Turtle Attack!</title>
    <meta charset="UTF-8">
</head>
<body>
<br>
<canvas id="myCanvas" width="1000" height="500" style="border:1px solid #cccccc;"></canvas>

<script type="text/javascript">

    class Sprite
    {
        constructor(x, y, w, h, image_url) //, update_method, onclick_method)
        {
            this.x = x;
            this.y = y;
            this.w = w;
            this.h = h;
            this.image = new Image();
            this.image.src = image_url;
        }

        draw()
        {}

        update()
        {}

        define()
        {}
    }

    class Model
    {
        constructor()

        {   this.sprites = [];
            this.bricks = [new Brick (250,400, 50, 50, this), new Brick(350,350, 50, 100, this)];
            this.coinBlocks = [new CoinBlock(450, 300, 50, 50, this)];
            this.mario = new Mario(50, 300);
            this.sprites.push(this.mario);
            for(let i = 0; i < this.bricks.length; i++)
            {
                this.sprites.push(this.bricks[i]);
            }
            for(let i = 0; i < this.coinBlocks.length; i++)
            {
                this.sprites.push(this.coinBlocks[i]);
            }
            this.scrollPos = 0;

        }

        update()

        {
            this.mario.scrollPos = this.scrollPos;
            for (let i = 0; i < this.sprites.length; i++)
            {
                this.sprites[i].update();
            }
        }

        addCoin(x, y)
        {
            this.sprites.push(new Coin(x, y, 25, 25, this));
        }

        deleteSprite()
        {
            this.sprites.pop();
        }

        collision(_x, _y, _w, _h)
        {
            if (this.mario.x + this.mario.w < _x)
                return false;
            if (this.mario.x >= _x + _w)
                return false;
            if (this.mario.y + this.mario.h <= _h)
                return false;
            if (this.mario.y >= _y + _h)
                return false;
            return true;
        }

        get_out(_x, _y, _w, _h, s)
        {
            if (this.mario.x + this.mario.w >= _x && this.mario.prev_x + this.mario.w <= _x && (this.mario.y + this.mario.h) > _y) //leftside
            {
                this.mario.x = _x - this.mario.w;
                //mario.xVel = -10;									   //for make bouncy
            }
            else if (this.mario.x <= _x + _w && this.mario.prev_x >= _x + _w && (this.mario.y + this.mario.h) > _y) //rightside
            {
                this.mario.x = _x + _w;
            }
            else if (this.mario.y + this.mario.h > _y && this.mario.prev_y + this.mario.h <= _y)	//topside
            {
                this.mario.y = _y - this.mario.h;
                this.mario.yVel = 0.0;
                this.mario.jumpTime = 0;
            }
            else if (this.mario.y < _y + _h && this.mario.prev_y >= _y + _h)	//bottomside
            {
                this.mario.y = _y + _h;
                this.mario.jumpTime = 40;								//keeps from weird mid-air fidgeting
                this.mario.yVel = 10.0;									//bouncy

                if (s.define() === "CoinBlock")
                {
                    //CoinBlock theBlock = (CoinBlock)s;
                    if (s.coinCount > 0)
                    {
                        this.addCoin(_x, _y);
                        s.coinCount--;
                    }
                }
            }
        }
    }

    class View
    {
        constructor(model, controller) {
            this.model = model;
            this.canvas = document.getElementById("myCanvas");
            this.background = new Image();
            this.background.src = "vaporwave.png";
        }

        update()
        {
            let ctx = this.canvas.getContext("2d");
            ctx.clearRect(0, 0, 1000, 500);
            ctx.drawImage(this.background,0,0, 1000, 500);
            for(let i = 0; i < this.model.sprites.length; i++)
                this.model.sprites[i].draw(ctx, this.model.scrollPos);
        }
    }

    class Controller
    {
        constructor(model, view)
        {
            this.model = model;
            this.view = view;
            this.key_right = false;
            this.key_left = false;
            this.key_up = false;
            this.key_down = false;
            let self = this;
            //view.canvas.addEventListener("click", function(event) { self.onClick(event); });
            document.addEventListener('keydown', function(event) { self.keyDown(event); }, false);
            document.addEventListener('keyup', function(event) { self.keyUp(event); }, false);
        }

        keyDown(event)
        {
            if(event.keyCode === 39) this.key_right = true;
            else if(event.keyCode === 37) this.key_left = true;
            else if(event.keyCode === 38) this.key_up = true;
            else if(event.keyCode === 40) this.key_down = true;
            else if(event.keyCode === 32) this.key_space = true;
        }

        keyUp(event)
        {
            if(event.keyCode === 39) this.key_right = false;
            else if(event.keyCode === 37) this.key_left = false;
            else if(event.keyCode === 38) this.key_up = false;
            else if(event.keyCode === 40) this.key_down = false;
            else if(event.keyCode === 32) this.key_space = false;
        }

        update()
        {
            this.model.mario.newton_third();
            if(this.key_right)
            {
                this.model.mario.xVel = 7;
                this.model.scrollPos = this.model.mario.x;
            }
            else if(this.key_right == false && this.model.mario.xVel > 0)
                this.model.mario.xVel = 0;
            if(this.key_left)
            {
                this.model.mario.xVel = -7;
                this.model.scrollPos = this.model.mario.x;
            }
            else if(this.key_left == false && this.model.mario.xVel < 0)
                this.model.mario.xVel = 0;
            if(this.key_space)
            {
                if(this.model.mario.jumpTime <= 6)
                {
                    if(this.model.mario.jumpTime % 2 == 0)
                        this.model.mario.yVel += -20;
                }
            }
        }
    }

    class Brick extends Sprite {
        constructor(x, y, w, h, model) {
            super(x, y, w, h);
            this.image = new Image();
            this.image.src = "brick.png";
            this.model = model;
        }

        draw(ctx) {
            ctx.drawImage(this.image, this.x - this.model.scrollPos, this.y, this.w, this.h);
        }

        define() {
            return "Brick";
        }

        update() {
            this.collision_flag = this.model.collision(this.x, this.y, this.w, this.h)

            if (this.collision_flag)
                this.model.get_out(this.x, this.y, this.w, this.h, this);
        }

    }


    class CoinBlock extends Sprite
    {
        constructor(x,y,w,h,model)
        {
            super(x,y,50,50);
            this.image = new Image();
            this.image.src = "CoinBlock.png";
            this.image2 = new Image();
            this.image2.src = "empty.png";
            this.model = model;
            this.collision_flag;
            this.coinCount = 5;
        }

        draw(ctx)
        {
            if(this.coinCount > 0)
                ctx.drawImage(this.image,this.x - this.model.scrollPos, this.y, this.w, this.h);
            else
                ctx.drawImage(this.image2,this.x - this.model.scrollPos, this.y, this.w, this.h);
        }

        define()
        {
            return "CoinBlock";
        }

        update()
        {
            this.collision_flag = this.model.collision(this.x, this.y, this.w, this.h)

            if(this.collision_flag)
                this.model.get_out(this.x, this.y, this.w, this.h, this);
        }
    }

    class Coin extends Sprite
    {
        constructor(x,y,w,h,model)
        {
            super(x,y,w,h);
            this.image = new Image();
            this.image.src = "Coin.png";
            this.model = model;
            this.yVel = -10;
            this.xVel = -10 + (20) * Math.random();
        }

        draw(ctx)
        {
            ctx.drawImage(this.image, this.x - this.model.scrollPos, this.y, this.w, this.h);
        }

        define()
        {
            return "Coin";
        }

        update()
        {
            this.yVel += 1;

            this.y += this.yVel;
            this.x += this.xVel;

            if (this.y > 700)
                this.model.deleteSprite(this);
        }


    }

    class Mario extends Sprite
    {
        constructor(x, y, w, h, model)
        {
            super(x,y,50,50);
            this.m = model;
            console.log(this.model +"update");
            this.yVel = 0;
            this.xVel = 0;
            this.marioImages = [];
            this.marioFrames = ["mario1.png", "mario2.png", "mario3.png", "mario4.png", "mario5.png"];
            this.jumpTime = 0;
            this.marioFrame = 0;
            this.prev_x = 0;
            this.prev_y = 0;
            this.scrollPos = 0;

            for(let i = 0; i < this.marioFrames.length; i++)
            {
                this.marioImages.push(new Image());
                this.marioImages[i].src = this.marioFrames[i];
            }

        }

        getAnimation()
        {
            return this.marioImages[this.marioFrame];
        }

        newton_third()
        {
            this.prev_x = this.x;
            this.prev_y = this.y;
        }



        draw(ctx)
        {
            ctx.drawImage(this.getAnimation(), this.x - this.scrollPos , this.y, this.w, this.h);
            //console.log(this.marioFrame);
        }

        define()
        {
            return "Mario";
        }

        update()
        {
            this.x += this.xVel;
            this.x = Math.abs(this.x);

            //this.x = this.x - this.model.scrollPos;
            if(this.xVel >= 15)				//max speed
            {
                this.xVel = 15;
            }

            if(this.xVel <= -15)
            {
                this.xVel = -15;
            }

            this.jumpTime ++;

            this.y += this.yVel;					//up down physics physics

            this.yVel += 9;					//gravity

            if(this.y >= 400)				//make floor
            {
                this.y = 400;
                this.yVel = 0;
                this.jumpTime = 0;
            }

            if(this.x <= 0)					//backwall
            {
                this.x = 0;
            }

            this.marioFrame = this.x % 5;
           // console.log(this.x +"update");





            // this.marioFrame = this.x % 5;
            // if(this.marioFrame == 0)
            // {
            //     this.image = "mario1.png";
            // }
            // else if(this.marioFrame == 1)
            // {
            //     this.image = "mario2.png";
            // }
            // else if(this.marioFrame == 2)
            // {
            //     this.image = "mario3.png";
            // }
            // else if(this.marioFrame == 3)
            // {
            //     this.image = "mario4.png";
            // }
            // else if(this.marioFrame == 4)
            // {
            //     this.image = "mario5.png";
            // }

        }

    }

    class Game
    {
        constructor()
        {
            this.model = new Model();
            this.view = new View(this.model,this.controller);
            this.controller = new Controller(this.model, this.view);
            this.brick = new Brick(this.model);
            this.mario = new Mario(this.model);
            //this.sprite = new Sprite(this.model);
            //this.coinBlock = new CoinBlock(this.model);
            //this.coin = new Coin(this.model);
        }

        onTimer()
        {
            this.controller.update();
            this.model.update();
            this.view.update();
            //this.mario.update();
        }
    }


    let game = new Game();
    let timer = setInterval(function() { game.onTimer(); }, 40);

</script>

</body>
