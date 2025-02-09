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
    ball: {shuffleTrigger: "BALL_LOST"},
    
}

let POINTS = 0
let GAME_STATES = {
    TOP_BALL_BOUNCERS: {
        left: false,
        middle: false,
        right: false
    }
}


Example.manipulation = function() {
    var Engine = Matter.Engine,
        Render = Matter.Render,
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
    var engine = Engine.create({positionIterations: 26, velocityIterations: 20, gravity: { scale: .0005, y: 2}}),
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
            showConvexHulls: true
        }
    });

    Render.run(render);

    // create runner
    var runner = Runner.create({delta: 1000 / 600});
    Runner.run(runner, engine);

    // add bodies
    var bodyLeftBase = Bodies.rectangle(200, 600, 200, 100, { isStatic: true, render: { fillStyle: '#060a19' } }),
        bodyRightBase = Bodies.rectangle(600, 600, 200, 100, { isStatic: true, render: { fillStyle: '#060a19' } }),
        ballyBoi = Bodies.circle(400, 100, 20, { friction: 0, render: { fillStyle: '#060a19' } });


    Composite.add(world, [ ballyBoi]); // bodyLeftBase, bodyRightBase

    Composite.add(world, [
        // walls
        Bodies.rectangle(400, -300, 800, 50, { isStatic: true }), // top
        Bodies.rectangle(400, 800, 800, 50, { angle: .1, isStatic: true }), //bottom
        Bodies.rectangle(675, 300, 50, 800, { isStatic: true }), // right left
        Bodies.rectangle(800, 300, 50, 1200, { isStatic: true }), //right right
        Bodies.rectangle(0, 300, 50, 1200, { isStatic: true }), //left
        Bodies.rectangle(50, 100, 50, 800, {angle: -.2,  isStatic: true }), //left
        Bodies.rectangle(725, -230, 50, 200, { angle: -.9, isStatic: true }) // bumper thing at top
    ]);



    
    // LEFT FLAPPER
    var groupLeft = Body.nextGroup(true),
        length = 150,
        width = 25;

    var leftFlapper = Composites.stack(150, 500, 1, 1, -20, 0, function(x, y) {
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
    let leftConstraint = Constraint.create({ 
        pointA: { x: leftFlapper.bodies[0].position.x + 0, y: leftFlapper.bodies[0].position.y - 100 },
        bodyB: leftFlapper.bodies[0],
        pointB: { x:  50, y: 0},
        stiffness: .9,
        length: 160,
        damping: 1,
    })
    Composite.add(leftFlapper, leftConstraint);
    Composite.add(world, leftFlapper);


    // RIGHT FLAPPER
    var groupRight = Body.nextGroup(true),
        length = 150,
        width = 25;

    var rightFlapper = Composites.stack(450, 500, 1, 1, -20, 0, function(x, y) {
        return Bodies.rectangle(x, y, length, width, { 
            collisionFilter: { group: groupRight },
            frictionAir: 0,
            chamfer: 5,
            render: {
                fillStyle: 'blue',
                lineWidth: 1
            }
        });
    });
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
    let rightConstraint = Constraint.create({ 
        pointA: { x: rightFlapper.bodies[0].position.x -100, y: rightFlapper.bodies[0].position.y - 100 },
        bodyB: rightFlapper.bodies[0],
        pointB: { x:  50, y: 0},
        stiffness: .9,
        length: 160,
        damping: 1,
    })
    Composite.add(rightFlapper, rightConstraint);
    Composite.add(world, rightFlapper);



    // UPDATE

    var lastTime = 0,
        scaleRate = 0.6;

    let leftPressed = false
    let rightPressed = false
    let upPressed = false
    let downPressed = false
    let releasePressure = 0
    document.addEventListener('keydown', function(event) {
        console.log("Key down", event.key)
        if(event.key=="ArrowLeft"){
            leftPressed = true
        }else if(event.key=="ArrowRight"){
            rightPressed = true
        }else if(event.key=="ArrowUp"){
            upPressed = true
        }else if(event.key=="ArrowDown"){
            downPressed = true
        }
    });
    document.addEventListener('keyup', function(event) {
        console.log("Key up", event.key)
        if(event.key=="ArrowLeft"){
            leftPressed = false
        }else if(event.key=="ArrowRight"){
            rightPressed = false
        }else if(event.key=="ArrowUp"){
            upPressed = false
        }else if(event.key=="ArrowDown"){
            downPressed = false
        }
    });

    Events.on(engine, 'beforeUpdate', function(event) {
        var timeScale = (event.delta || (1000 / 60)) / 1000;

        // cyclic motion move up and down
        var py = 300 + 100 * Math.sin(engine.timing.timestamp * 0.002);

        // build up pressure
        if(downPressed==true){
            let pressureRate = 20            
            releasePressure += timeScale*pressureRate
        }
        // shoot up
        if(downPressed==false && releasePressure>0){
            
            Body.setVelocity(ballyBoi, { x: 0, y: -releasePressure});
            releasePressure = 0;
        }
        
        if(upPressed==true){
            Body.setPosition(ballyBoi, { x: 225, y: -100 }, true);
            
            // Body.setVelocity(ballyBoi, { x: Math.floor(Math.random() * 10)-5, y: Math.floor(Math.random() * 10)-5 });
            Body.setVelocity(ballyBoi, { x: 0, y: 0 });
        }

        if(leftPressed==true){
            leftConstraint.length=0
            leftConstraint.stiffness=.01
        }else{
            leftConstraint.length=150
            leftConstraint.stiffness=.1
        }

        
        if(rightPressed==true){
            rightConstraint.length=0
        }else{
            rightConstraint.length=150
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
        stop: function() {
            Matter.Render.stop(render);
            Matter.Runner.stop(runner);
        }
    };
    
};

Example.manipulation.title = 'Manipulation';
Example.manipulation.for = '>=0.14.2';

Example.manipulation()

// will need to build a render on top of this
// https://github.com/liabru/matter-js/wiki/Rendering
// This is where customization can come in















if (typeof module !== 'undefined') {
    module.exports = Example.manipulation;
}