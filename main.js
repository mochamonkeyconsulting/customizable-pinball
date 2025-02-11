import {Render} from "./Render.js";

var Example = Example || {};


// other game stuff
const EVENT_TRIGGERS = [
    "BALL_LAUNCH",
    "BALL_LOST",
    "GAME_START",
    "MULTIPLIER_ACTIVATED"
]

const ASSETS = {
    backgroundMusic: {},
    background: {},
    ball: { shuffleTrigger: "BALL_LOST" },

}

let POINTS = 0
let GAME_STATES = {
    TOP_BALL_BOUNCERS: {
        left: false,
        middle: false,
        right: false
    }
}


Example.manipulation = function () {
    var Engine = Matter.Engine,
        Runner = Matter.Runner,
        Body = Matter.Body,
        Events = Matter.Events,
        Constraint = Matter.Constraint,
        MouseConstraint = Matter.MouseConstraint,
        Mouse = Matter.Mouse,
        Composite = Matter.Composite,
        Composites = Matter.Composites,
        Bodies = Matter.Bodies;

    // create engine
    var engine = Engine.create({ positionIterations: 26, velocityIterations: 20, gravity: { scale: .0005, y: 2 } }),
        world = engine.world;

    // create renderer
    var render = Render.create({
        element: document.body,
        engine: engine,
        options: {
            width: 800,
            height: 1200,
            showAxes: true,
            showCollisions: true,
            showConvexHulls: true,
            showAngleIndicator: false,
            wireframes: false,
            showStats: true,
            showPerformance: true
        }
    });

    Render.run(render);

    // create runner
    var runner = Runner.create({ delta: 1000 / 600 });
    Runner.run(runner, engine);
    
    function limitVelocity(body, maxVelocity){
        const { x, y } = body.velocity
        if(x > maxVelocity){
            Body.setVelocity(body, {x:maxVelocity, y})
        }
        if(x < -maxVelocity){
            Body.setVelocity(body, {x:-maxVelocity, y})
        }
        if(y > maxVelocity){
            Body.setVelocity(body, {x, y:maxVelocity})
        }
        if(y < -maxVelocity){
            Body.setVelocity(body, {x, y:-maxVelocity})
        }
    }


    // add bodies
    var bodyLeftBase = Bodies.rectangle(200, 600, 200, 100, { isStatic: true, render: { fillStyle: '#060a19' } }),
        bodyRightBase = Bodies.rectangle(600, 600, 200, 100, { isStatic: true, render: { fillStyle: '#060a19' } }),
        ballyBoi = Bodies.circle(400, 100, 15, { friction: 0, restitution:.5, render: { sprite: { yScale: 1/17, xScale: 1/17, texture: './assets/ball.png'} } });


    Composite.add(world, [ballyBoi]); // bodyLeftBase, bodyRightBase

    Composite.add(world, [
        // walls
        Bodies.rectangle(400, -300, 800, 50, { isStatic: true }), // top
        Bodies.rectangle(400, 800, 800, 50, { angle: .1, isStatic: true }), //bottom
        Bodies.rectangle(700, 300, 25, 800, { isStatic: true }), // right left
        Bodies.rectangle(800, 300, 50, 1200, { isStatic: true }), //right right
        Bodies.rectangle(0, 300, 50, 1200, { isStatic: true }), //left
        // Bodies.rectangle(100, 200, 50, 800, { angle: -.2, isStatic: true }), //left
        Bodies.rectangle(725, -230, 50, 200, { angle: -.9, isStatic: true }), // bumper thing at top
        Bodies.trapezoid(575, 550, 300, 150, .9, { angle: -3.75, isStatic: true })
    ]);




    // LEFT FLAPPER
    var groupLeft = Body.nextGroup(true),
        length = 100,
        width = 10;

    var leftFlapper = Composites.stack(200, 600, 1, 1, -20, 0, function (x, y) {
        return Bodies.rectangle(x, y, length, width, {
            collisionFilter: { group: groupLeft },
            frictionAir: 0,
            chamfer: 5,
            //restitution: .9, 
            render: {
                fillStyle: 'blue',
                lineWidth: 1
            }
        });
    });
    // Anchor
    Composite.add(leftFlapper, Constraint.create({
        bodyB: leftFlapper.bodies[0],
        pointB: { x: -length * 0.42, y: 0 },
        pointA: { x: leftFlapper.bodies[0].position.x - length * 0.42, y: leftFlapper.bodies[0].position.y },
        stiffness: 1,
        length: 0,
        render: {
            strokeStyle: '#4a485b'
        }
    }));
    // FLAP_ON
    let leftConstraintOn = Constraint.create({
        pointA: { x: leftFlapper.bodies[0].position.x + 50, y: leftFlapper.bodies[0].position.y - 100 },
        bodyB: leftFlapper.bodies[0],
        pointB: { x: 50, y: 0 },
        stiffness: 0,
        length: 0,
        damping: .5,
    })
    // FLAP_OFF
    let leftConstraintOff = Constraint.create({
        pointA: { x: leftFlapper.bodies[0].position.x + 50, y: leftFlapper.bodies[0].position.y + 100 },
        bodyB: leftFlapper.bodies[0],
        pointB: { x: 50, y: 0 },
        stiffness: 0,
        length: 0,
        damping: .5,
    })

    Composite.add(leftFlapper, leftConstraintOn);
    Composite.add(leftFlapper, leftConstraintOff);
    Composite.add(world, leftFlapper);

    // RIGHT FLAPPER
    var groupRight = Body.nextGroup(true),
        length = 100,
        width = 10;

    var rightFlapper = Composites.stack(400, 600, 1, 1, -20, 0, function (x, y) {
        return Bodies.rectangle(x, y, length, width, {
            collisionFilter: { group: groupRight },
            frictionAir: 0,
            chamfer: 5,
            //restitution: .9, 
            render: {
                fillStyle: 'blue',
                lineWidth: 1
            }
        });
    });
    // Anchor
    Composite.add(rightFlapper, Constraint.create({
        bodyB: rightFlapper.bodies[0],
        pointB: { x: -length * 0.42, y: 0 },
        pointA: { x: rightFlapper.bodies[0].position.x - length * 0.42, y: rightFlapper.bodies[0].position.y },
        stiffness: 1,
        length: 0,
        render: {
            strokeStyle: '#4a485b'
        }
    }));
    // FLAP_ON
    let rightConstraintOn = Constraint.create({
        pointA: { x: rightFlapper.bodies[0].position.x - 150, y: rightFlapper.bodies[0].position.y - 100 },
        bodyB: rightFlapper.bodies[0],
        pointB: { x: 50, y: 0 },
        stiffness: 0,
        length: 0,
        damping: .5,
    })
    // FLAP_OFF
    let rightConstraintOff = Constraint.create({
        pointA: { x: rightFlapper.bodies[0].position.x -150, y: rightFlapper.bodies[0].position.y + 100 },
        bodyB: rightFlapper.bodies[0],
        pointB: { x: 50, y: 0 },
        stiffness: 0,
        length: 0,
        damping: .5,
    })

    Composite.add(rightFlapper, rightConstraintOn);
    Composite.add(rightFlapper, rightConstraintOff);
    Composite.add(world, rightFlapper);






    // ENV 
    
    // BUMPERS
    var size = 200,
        x = 200,
        y = 200,
        partA = Bodies.rectangle(x, y, size, size / 5),
        partB = Bodies.rectangle(x, y, size / 5, size, { render: partA.render });

    var compoundBodyA = Body.create({
        parts: [partA, partB]
    });

    size = 100;
    x = 400;
    y = -200;

    var partC = Bodies.circle(x, y, 20, { restitution:.1 }),
        partD = Bodies.circle(x + size, y, 20, { restitution:.3 }),
        partE = Bodies.circle(x + size, y + size, 20, { restitution:.5 }),
        partF = Bodies.circle(x, y + size, 20, { restitution:.3 });

    var compoundBodyB = Body.create({
        parts: [partC, partD, partE, partF]
    });

    var constraint = Constraint.create({
        pointA: { x: 400, y: -300 },
        bodyB: compoundBodyB,
        pointB: { x: 0, y: 0 }
    });

    Composite.add(world, [
        // compoundBodyA, 
        compoundBodyB, 
        constraint
    ]);

    var score = 0;
    function addScore(amount){
        score+=amount
    }

    const BUMPER_SIZE = 70
    var rightBumper =  Bodies.rectangle(450, 475, 150, 60, { angle: -.6, chamfer: { radius: [50, 0, 20, 0] },  restitution: .9, isStatic: true, handler: "bumper", bumperXPush: -5, bumperYPush: -15 });
    var leftBumper =  Bodies.rectangle(50, 200, 150, 60, { angle: -2.5, chamfer: { radius: [50, 0, 20, 0] },  restitution: .9, isStatic: true, handler: "bumper", bumperXPush: 2, bumperYPush: -10 });

    function collisionStartHandlerBumper(event, pair, i){
        if(pair.bodyA.handler == "bumper"){
            console.log("BUMPER BUMPED")
            Body.setVelocity(pair.bodyB, {x:pair.bodyB.velocity.x+pair.bodyA.bumperXPush,y: pair.bodyB.velocity.y+pair.bodyA.bumperYPush})
            addScore(1)
        }
        if(pair.bodyB.handler == "bumper"){
            console.log("BUMPER BUMPED")
            Body.setVelocity(pair.bodyA, {x:pair.bodyA.velocity.x+pair.bodyB.bumperXPush,y: pair.bodyA.velocity.y+pair.bodyB.bumperYPush})
            addScore(1)
        }
    }

    const collisionStartHandlers = {
        "bumper": collisionStartHandlerBumper
    }


    // an example of using collisionStart event on an engine
    Events.on(engine, 'collisionStart', function(event) {
        var pairs = event.pairs;

        // change object colours to show those starting a collision
        for (var i = 0; i < pairs.length; i++) {
            var pair = pairs[i];
            if(pair.bodyA.handler){
                collisionStartHandlers[pair.bodyA.handler](event, pair, i)
            }
            if(pair.bodyB.handler){
                collisionStartHandlers[pair.bodyB.handler](event, pair, i)
            }
        }
    });




    Composite.add(world, [
        rightBumper, leftBumper
    ]);


    // UPDATE

    var lastTime = 0,
        scaleRate = 0.6;

    let leftPressed = false
    let rightPressed = false
    let upPressed = false
    let downPressed = false
    let releasePressure = 0
    document.addEventListener('keydown', function (event) {
        console.log("Key down", event.key)
        if (event.key == "ArrowLeft") {
            leftPressed = true
        } else if (event.key == "ArrowRight") {
            rightPressed = true
        } else if (event.key == "ArrowUp") {
            upPressed = true
        } else if (event.key == "ArrowDown") {
            downPressed = true
        }
    });
    document.addEventListener('keyup', function (event) {
        console.log("Key up", event.key)
        if (event.key == "ArrowLeft") {
            leftPressed = false
        } else if (event.key == "ArrowRight") {
            rightPressed = false
        } else if (event.key == "ArrowUp") {
            upPressed = false
        } else if (event.key == "ArrowDown") {
            downPressed = false
        }
    });

    Events.on(engine, 'beforeUpdate', function (event) {
        var timeScale = (event.delta || (1000 / 60)) / 1000;

        // cyclic motion move up and down
        var py = 300 + 100 * Math.sin(engine.timing.timestamp * 0.002);

        // build up pressure
        if (downPressed == true) {
            let pressureRate = 20
            releasePressure += timeScale * pressureRate
        }
        // shoot up
        if (downPressed == false && releasePressure > 0) {

            Body.setVelocity(ballyBoi, { x: 0, y: -releasePressure });
            releasePressure = 0;
        }

        if (upPressed == true) {
            Body.setPosition(ballyBoi, { x: 225, y: -100 }, true);

            // Body.setVelocity(ballyBoi, { x: Math.floor(Math.random() * 10)-5, y: Math.floor(Math.random() * 10)-5 });
            Body.setVelocity(ballyBoi, { x: 0, y: 0 });
        }
        limitVelocity(ballyBoi, 40)

        if (leftPressed == true) {
            leftConstraintOn.stiffness = .01
            leftConstraintOff.stiffness = 0
        } else {
            leftConstraintOn.stiffness = 0
            leftConstraintOff.stiffness = .01
        }


        if (rightPressed == true) {
            rightConstraintOn.stiffness = .01
            rightConstraintOff.stiffness = 0
        } else {
            rightConstraintOn.stiffness = 0
            rightConstraintOff.stiffness = .01
        }






    });

    // add mouse control
    var mouse = Mouse.create(render.canvas),
        mouseConstraint = MouseConstraint.create(engine, {
            mouse: mouse,
            constraint: {
                stiffness: 0.2,
                render: {
                    visible: false
                }
            }
        });

    Composite.add(world, mouseConstraint);

    // keep the mouse in sync with rendering
    render.mouse = mouse;

    // fit the render viewport to the scene
    Render.lookAt(render, {
        min: { x: 0, y: 0 },
        max: { x: 800, y: 600 }
    });



    // var canvas = document.createElement('canvas'),
    // context = canvas.getContext('2d');

    // canvas.width = 800;
    // canvas.height = 600;

    // document.body.appendChild(canvas);

    // (function render() {
    // var bodies = Composite.allBodies(engine.world);

    // window.requestAnimationFrame(render);

    // context.fillStyle = '#fff';
    // context.fillRect(0, 0, canvas.width, canvas.height);

    // context.beginPath();

    // for (var i = 0; i < bodies.length; i += 1) {
    //     var vertices = bodies[i].vertices;

    //     context.moveTo(vertices[0].x, vertices[0].y);

    //     for (var j = 1; j < vertices.length; j += 1) {
    //         context.lineTo(vertices[j].x, vertices[j].y);
    //     }

    //     context.lineTo(vertices[0].x, vertices[0].y);
    // }

    // context.lineWidth = 1;
    // context.strokeStyle = '#999';
    // context.stroke();
    // })();



    // context for MatterTools.Demo
    return {
        engine: engine,
        runner: runner,
        render: render,
        canvas: render.canvas,
        stop: function () {
            Matter.Render.stop(render);
            Matter.Runner.stop(runner);
        }
    };

};
Matter.Resolver._restingThresh = 0.001

Example.manipulation.title = 'Manipulation';
Example.manipulation.for = '>=0.14.2';

Example.manipulation()

// will need to build a render on top of this
// https://github.com/liabru/matter-js/wiki/Rendering
// This is where customization can come in













if (typeof module !== 'undefined') {
    module.exports = Example.manipulation;
}