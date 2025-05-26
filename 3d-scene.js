// 3D Hotel Scene using Three.js
let scene, camera, renderer, controls;
let tables = [];
let selectedTable = null;

// Initialize the 3D scene
function init3DScene() {
    // Create the scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf7f7f7);
    
    // Create camera
    camera = new THREE.PerspectiveCamera(
        60, 
        document.getElementById('canvas-container').clientWidth / 
        document.getElementById('canvas-container').clientHeight, 
        0.1, 
        1000
    );
    camera.position.set(0, 15, 20);
    
    // Create renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(
        document.getElementById('canvas-container').clientWidth, 
        document.getElementById('canvas-container').clientHeight
    );
    document.getElementById('canvas-container').appendChild(renderer.domElement);
    
    // Add controls
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2;
    
    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 7);
    directionalLight.castShadow = true;
    scene.add(directionalLight);
    
    // Create floor
    const floorGeometry = new THREE.PlaneGeometry(50, 50);
    const floorMaterial = new THREE.MeshPhongMaterial({ 
        color: 0xe5e5e5,
        side: THREE.DoubleSide
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = Math.PI / 2;
    floor.position.y = -0.5;
    scene.add(floor);
    
    // Create walls
    createWalls();
    
    // Create tables and chairs
    createTables();
    
    // Add bar/counter
    createCounter();
    
    // Create raycaster for selection
    setupRaycaster();
    
    // Start animation loop
    animate();
}

function createWalls() {
    // Back wall
    const backWallGeometry = new THREE.BoxGeometry(50, 10, 0.5);
    const wallMaterial = new THREE.MeshPhongMaterial({ color: 0xF7F4F4 });
    const backWall = new THREE.Mesh(backWallGeometry, wallMaterial);
    backWall.position.set(0, 5, -25);
    scene.add(backWall);
    
    // Left wall
    const leftWallGeometry = new THREE.BoxGeometry(0.5, 10, 50);
    const leftWall = new THREE.Mesh(leftWallGeometry, wallMaterial);
    leftWall.position.set(-25, 5, 0);
    scene.add(leftWall);
    
    // Right wall
    const rightWall = new THREE.Mesh(leftWallGeometry, wallMaterial);
    rightWall.position.set(25, 5, 0);
    scene.add(rightWall);
    
    // Front wall with entrance
    const frontWallLeft = new THREE.Mesh(
        new THREE.BoxGeometry(20, 10, 0.5),
        wallMaterial
    );
    frontWallLeft.position.set(-15, 5, 25);
    scene.add(frontWallLeft);
    
    const frontWallRight = new THREE.Mesh(
        new THREE.BoxGeometry(20, 10, 0.5),
        wallMaterial
    );
    frontWallRight.position.set(15, 5, 25);
    scene.add(frontWallRight);
    
    // Door frame
    const doorFrameMaterial = new THREE.MeshPhongMaterial({ color: 0x552834 });
    const doorTop = new THREE.Mesh(
        new THREE.BoxGeometry(10, 1, 0.5),
        doorFrameMaterial
    );
    doorTop.position.set(0, 9.5, 25);
    scene.add(doorTop);
}

function createTables() {
    const tablePositions = [
        { x: -15, z: -15, number: 1 },
        { x: -15, z: -5, number: 2 },
        { x: -15, z: 5, number: 3 },
        { x: -15, z: 15, number: 4 },
        { x: 0, z: -15, number: 5 },
        { x: 0, z: -5, number: 6 },
        { x: 0, z: 5, number: 7 },
        { x: 0, z: 15, number: 8 },
        { x: 15, z: -15, number: 9 },
        { x: 15, z: -5, number: 10 },
        { x: 15, z: 5, number: 11 },
        { x: 15, z: 15, number: 12 }
    ];
    
    tablePositions.forEach(pos => {
        createTable(pos.x, pos.z, pos.number);
    });
}

function createTable(x, z, number) {
    const tableGroup = new THREE.Group();
    tableGroup.userData = { type: 'table', number: number };
    
    // Create table top
    const tableGeometry = new THREE.BoxGeometry(4, 0.2, 4);
    const tableMaterial = new THREE.MeshPhongMaterial({
        color: 0x8B4513
    });
    const table = new THREE.Mesh(tableGeometry, tableMaterial);
    table.position.y = 1;
    tableGroup.add(table);
    
    // Create table legs
    const legGeometry = new THREE.BoxGeometry(0.2, 1, 0.2);
    const legMaterial = new THREE.MeshPhongMaterial({
        color: 0x6A3A21
    });
    
    // Add legs at each corner
    for (let i = -1; i <= 1; i += 2) {
        for (let j = -1; j <= 1; j += 2) {
            const leg = new THREE.Mesh(legGeometry, legMaterial);
            leg.position.set(i * 1.8, 0.5, j * 1.8);
            tableGroup.add(leg);
        }
    }
    
    // Create chairs
    const chairPositions = [
        { x: 0, z: -2 },
        { x: 0, z: 2 },
        { x: -2, z: 0 },
        { x: 2, z: 0 }
    ];
    
    chairPositions.forEach(pos => {
        const chair = createChair();
        chair.position.set(pos.x, 0, pos.z);
        
        // Orient chair to face the table
        if (pos.z < 0) chair.rotation.y = Math.PI;
        else if (pos.z > 0) chair.rotation.y = 0;
        else if (pos.x < 0) chair.rotation.y = Math.PI / 2;
        else if (pos.x > 0) chair.rotation.y = -Math.PI / 2;
        
        tableGroup.add(chair);
    });
    
    // Add table number
    const loader = new THREE.TextureLoader();
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 64;
    canvas.height = 64;
    context.fillStyle = 'white';
    context.fillRect(0, 0, 64, 64);
    context.font = '48px Arial';
    context.fillStyle = 'black';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(number.toString(), 32, 32);
    
    const texture = new THREE.CanvasTexture(canvas);
    const numberMaterial = new THREE.MeshBasicMaterial({ 
        map: texture,
        transparent: true
    });
    const numberGeometry = new THREE.PlaneGeometry(1, 1);
    const numberPlane = new THREE.Mesh(numberGeometry, numberMaterial);
    numberPlane.rotation.x = -Math.PI / 2;
    numberPlane.position.y = 1.1;
    tableGroup.add(numberPlane);
    
    // Position the entire table group
    tableGroup.position.set(x, 0, z);
    scene.add(tableGroup);
    
    tables.push({
        object: tableGroup,
        number: number,
        position: { x, z }
    });
}

function createChair() {
    const chairGroup = new THREE.Group();
    
    // Chair seat
    const seatGeometry = new THREE.BoxGeometry(1.2, 0.1, 1.2);
    const chairMaterial = new THREE.MeshPhongMaterial({
        color: 0x5D4037
    });
    const seat = new THREE.Mesh(seatGeometry, chairMaterial);
    seat.position.y = 0.5;
    chairGroup.add(seat);
    
    // Chair backrest
    const backrestGeometry = new THREE.BoxGeometry(1.2, 1.2, 0.1);
    const backrest = new THREE.Mesh(backrestGeometry, chairMaterial);
    backrest.position.set(0, 1.1, -0.6);
    chairGroup.add(backrest);
    
    // Chair legs
    const legGeometry = new THREE.BoxGeometry(0.1, 0.5, 0.1);
    const legMaterial = new THREE.MeshPhongMaterial({
        color: 0x4E342E
    });
    
    // Add legs at each corner of the seat
    for (let i = -1; i <= 1; i += 2) {
        for (let j = -1; j <= 1; j += 2) {
            const leg = new THREE.Mesh(legGeometry, legMaterial);
            leg.position.set(i * 0.5, 0.25, j * 0.5);
            chairGroup.add(leg);
        }
    }
    
    return chairGroup;
}

function createCounter() {
    const counterGroup = new THREE.Group();
    
    // Counter top
    const counterTopGeometry = new THREE.BoxGeometry(15, 0.5, 3);
    const counterTopMaterial = new THREE.MeshPhongMaterial({
        color: 0x552834
    });
    const counterTop = new THREE.Mesh(counterTopGeometry, counterTopMaterial);
    counterTop.position.y = 1.5;
    counterGroup.add(counterTop);
    
    // Counter base
    const counterBaseGeometry = new THREE.BoxGeometry(15, 1.5, 2.8);
    const counterBaseMaterial = new THREE.MeshPhongMaterial({
        color: 0x6A3140
    });
    const counterBase = new THREE.Mesh(counterBaseGeometry, counterBaseMaterial);
    counterBase.position.y = 0.75;
    counterGroup.add(counterBase);
    
    // Position the counter at the back wall
    counterGroup.position.set(0, 0, -22);
    scene.add(counterGroup);
    
    // Add stools in front of the counter
    for (let x = -6; x <= 6; x += 3) {
        const stool = createStool();
        stool.position.set(x, 0, -19);
        scene.add(stool);
    }
}

function createStool() {
    const stoolGroup = new THREE.Group();
    
    // Stool seat
    const seatGeometry = new THREE.CylinderGeometry(0.8, 0.8, 0.1, 16);
    const stoolMaterial = new THREE.MeshPhongMaterial({
        color: 0x552834
    });
    const seat = new THREE.Mesh(seatGeometry, stoolMaterial);
    seat.position.y = 1;
    stoolGroup.add(seat);
    
    // Stool leg
    const legGeometry = new THREE.CylinderGeometry(0.1, 0.1, 1, 8);
    const legMaterial = new THREE.MeshPhongMaterial({
        color: 0x3E2723
    });
    const leg = new THREE.Mesh(legGeometry, legMaterial);
    leg.position.y = 0.5;
    stoolGroup.add(leg);
    
    // Stool base
    const baseGeometry = new THREE.CylinderGeometry(0.5, 0.5, 0.05, 16);
    const base = new THREE.Mesh(baseGeometry, legMaterial);
    base.position.y = 0.025;
    stoolGroup.add(base);
    
    return stoolGroup;
}

function setupRaycaster() {
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    
    renderer.domElement.addEventListener('click', event => {
        // Calculate mouse position in normalized device coordinates
        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        
        // Update the raycaster
        raycaster.setFromCamera(mouse, camera);
        
        // Find intersected objects
        const intersects = raycaster.intersectObjects(scene.children, true);
        
        if (intersects.length > 0) {
            // Find the first intersected object that is a table
            let tableObj = findTableInIntersections(intersects);
            if (tableObj) {
                highlightTable(tableObj);
                selectTable(tableObj.userData.number);
            }
        }
    });
}

function findTableInIntersections(intersects) {
    // Traverse up from the intersected object to find a parent with table data
    for (let i = 0; i < intersects.length; i++) {
        let object = intersects[i].object;
        
        // Check if the object itself is a table
        if (object.userData && object.userData.type === 'table') {
            return object;
        }
        
        // Check if it's part of a table (traversing up to parent)
        let parent = object.parent;
        while (parent) {
            if (parent.userData && parent.userData.type === 'table') {
                return parent;
            }
            parent = parent.parent;
        }
    }
    return null;
}

function highlightTable(tableObj) {
    // Reset color of previously selected table
    if (selectedTable) {
        selectedTable.children.forEach(child => {
            if (child.material && child.material.color) {
                child.material.color.set(0x8B4513);
            }
        });
    }
    
    // Highlight newly selected table
    tableObj.children.forEach(child => {
        if (child.material && child.material.color) {
            child.material.color.set(0x552834);
        }
    });
    
    selectedTable = tableObj;
}

function selectTable(tableNumber) {
    // Trigger event for table selection
    const event = new CustomEvent('tableSelected', {
        detail: { tableNumber }
    });
    document.dispatchEvent(event);
}

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

// Handle window resize
window.addEventListener('resize', () => {
    const container = document.getElementById('canvas-container');
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
});

// Initialize when the page loads
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('canvas-container')) {
        init3DScene();
    }
});
