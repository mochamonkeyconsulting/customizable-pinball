var Example = Example || {};


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
    var bodyA = Bodies.rectangle(100, 300, 50, 50, { isStatic: true, render: { fillStyle: '#060a19' } }),
        bodyB = Bodies.rectangle(200, 200, 50, 50),
        bodyLeftBase = Bodies.rectangle(200, 600, 200, 100, { isStatic: true, render: { fillStyle: '#060a19' } }),
        bodyD = Bodies.rectangle(400, 200, 50, 50),
        bodyE = Bodies.rectangle(550, 200, 50, 50),
        bodyF = Bodies.rectangle(700, 200, 50, 50),
        ballyBoi = Bodies.circle(400, 100, 20, { render: { fillStyle: '#060a19' } });

    // add compound body
    var partA = Bodies.rectangle(600, 200, 120 * 0.8, 50 * 0.8, { render: { fillStyle: '#060a19' } }),
        partB = Bodies.rectangle(660, 200, 50 * 0.8, 190 * 0.8, { render: { fillStyle: '#060a19' } }),
        compound = Body.create({
            parts: [partA, partB],
            isStatic: true
        });

    Body.setPosition(compound, { x: 600, y: 300 });

    Composite.add(world, [bodyA, bodyB, bodyLeftBase, bodyD, bodyE, bodyF, ballyBoi, compound]);

    Composite.add(world, [
        // walls
        Bodies.rectangle(400, -300, 800, 50, { isStatic: true }),
        Bodies.rectangle(400, 900, 800, 50, { isStatic: true }),
        Bodies.rectangle(800, 300, 50, 1200, { isStatic: true }),
        Bodies.rectangle(0, 300, 50, 1200, { isStatic: true })
    ]);


    // add bodies
    var group = Body.nextGroup(true),
        length = 150,
        width = 25;

    var leftFlapper = Composites.stack(200, 500, 1, 1, -20, 0, function(x, y) {
        return Bodies.rectangle(x, y, length, width, { 
            collisionFilter: { group: group },
            frictionAir: 0,
            chamfer: 5,
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
        stiffness: 0.9,
        length: 0,
        render: {
            strokeStyle: '#4a485b'
        }
    }));

    
    Composite.add(world, leftFlapper);



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

        if (scaleRate > 0) {
            // Body.scale(bodyF, 1 + (scaleRate * timeScale), 1 + (scaleRate * timeScale));

            // modify bodyE vertices
            bodyE.vertices[0].x -= 0.2 * timeScale;
            bodyE.vertices[0].y -= 0.2 * timeScale;
            bodyE.vertices[1].x += 0.2 * timeScale;
            bodyE.vertices[1].y -= 0.2 * timeScale;
            Body.setVertices(bodyE, bodyE.vertices);
        }

        // make bodyA move up and down
        var py = 300 + 100 * Math.sin(engine.timing.timestamp * 0.002);

        // manual update velocity required for older releases
        if (Matter.version === '0.18.0') {
            Body.setVelocity(bodyA, { x: 0, y: py - bodyA.position.y });
            Body.setVelocity(compound, { x: 0, y: py - compound.position.y });
            Body.setAngularVelocity(compound, 1 * Math.PI * timeScale);
        }

        // move body and update velocity
        Body.setPosition(bodyA, { x: 100, y: py }, true);

        // move compound body move up and down and update velocity
        Body.setPosition(compound, { x: 600, y: py }, true);

        // rotate compound body and update angular velocity
        Body.rotate(compound, 1 * Math.PI * timeScale, null, true);

        // after first 0.8 sec (simulation time)
        if (engine.timing.timestamp >= 800)
            Body.setStatic(bodyF, true);

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
            Body.setPosition(ballyBoi, { x: 325, y: -100 }, true);
            
            // Body.setVelocity(ballyBoi, { x: Math.floor(Math.random() * 10)-5, y: Math.floor(Math.random() * 10)-5 });
            Body.setVelocity(ballyBoi, { x: 0, y: 0 });
        }

        if(leftPressed==true){
            
            Body.setVelocity(Composite.allBodies(leftFlapper)[0], { x: 10, y: -40 });
        }


        

        // every 1.5 sec (simulation time)
        if (engine.timing.timestamp - lastTime >= 1500) {
            Body.setVelocity(bodyB, { x: 0, y: -10 });
            // Body.setAngle(bodyLeftBase, -Math.PI * 0.26);
            Body.setAngularVelocity(bodyD, 0.2);

            // stop scaling
            scaleRate = 0;
            
            // update last time
            lastTime = engine.timing.timestamp;
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