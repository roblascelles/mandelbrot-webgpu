import mandelbrotShader from './mandelbrot.wgsl?raw';
import juliaShader from './julia.wgsl?raw';
import burningShipShader from './burning-ship.wgsl?raw';
import tricornShader from './tricorn.wgsl?raw';
import multibrotShader from './multibrot.wgsl?raw';

// Fractal configurations
const fractals = [
    { name: 'Mandelbrot', shader: mandelbrotShader, centre: { x: -0.5, y: 0.0 }, zoom: 1.0 },
    { name: 'Julia Set', shader: juliaShader, centre: { x: 0.0, y: 0.0 }, zoom: 1.5 },
    { name: 'Burning Ship', shader: burningShipShader, centre: { x: -0.5, y: -0.5 }, zoom: 0.7 },
    { name: 'Tricorn', shader: tricornShader, centre: { x: -0.5, y: 0.0 }, zoom: 1.0 },
    { name: 'Multibrot (z³)', shader: multibrotShader, centre: { x: 0.0, y: 0.0 }, zoom: 1.2 },
];

// main.js
async function init() {
    if (!navigator.gpu) {
        alert("WebGPU is not supported in this browser.");
        return;
    }

    const adapter = await navigator.gpu.requestAdapter();
    const device = await adapter.requestDevice();

    const canvas = document.getElementById('gpuCanvas');
    const context = canvas.getContext('webgpu');
    const format = navigator.gpu.getPreferredCanvasFormat();

    // Set canvas size to match window
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();

    context.configure({
        device: device,
        format: format,
        alphaMode: 'premultiplied',
    });

    // Create uniform buffer for fractal parameters
    const uniformBufferSize = 4 * 4; // 2 floats (centre) + 1 float (zoom) + 1 float (aspect_ratio) = 16 bytes
    const uniformBuffer = device.createBuffer({
        size: uniformBufferSize,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    // Current fractal state
    let currentFractalIndex = 0;
    let centre = { ...fractals[0].centre };
    let zoom = fractals[0].zoom;
    let aspect_ratio = canvas.width / canvas.height;

    // Get UI elements
    const indicator = document.getElementById('indicator');
    const versionDisplay = document.getElementById('version-display');

    function updateIndicator() {
        indicator.textContent = `${currentFractalIndex + 1}. ${fractals[currentFractalIndex].name} | Press 1-5 to switch`;
    }
    updateIndicator();
    versionDisplay.textContent = `v${__APP_VERSION__}`;

    // Create pipeline and bind group
    let pipeline;
    let bindGroup;

    function createPipeline() {
        const shaderModule = device.createShaderModule({ 
            code: fractals[currentFractalIndex].shader 
        });

        pipeline = device.createRenderPipeline({
            layout: 'auto',
            vertex: {
                module: shaderModule,
                entryPoint: 'vs_main',
            },
            fragment: {
                module: shaderModule,
                entryPoint: 'fs_main',
                targets: [{ format: format }],
            },
            primitive: {
                topology: 'triangle-list',
            },
        });

        bindGroup = device.createBindGroup({
            layout: pipeline.getBindGroupLayout(0),
            entries: [{
                binding: 0,
                resource: { buffer: uniformBuffer },
            }],
        });
    }

    createPipeline();

    // Render function
    function render() {
        // Update uniform buffer
        const uniformData = new Float32Array([
            centre.x, centre.y,
            zoom,
            aspect_ratio
        ]);
        device.queue.writeBuffer(uniformBuffer, 0, uniformData);

        // Create a command encoder to record instructions
        const commandEncoder = device.createCommandEncoder();
        const textureView = context.getCurrentTexture().createView();

        const renderPassDescriptor = {
            colorAttachments: [{
                view: textureView,
                clearValue: { r: 0.1, g: 0.1, b: 0.1, a: 1.0 },
                loadOp: 'clear',
                storeOp: 'store',
            }],
        };

        const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);
        passEncoder.setPipeline(pipeline);
        passEncoder.setBindGroup(0, bindGroup);
        passEncoder.draw(3);
        passEncoder.end();

        device.queue.submit([commandEncoder.finish()]);
    }

    // Mouse interaction state
    let isDragging = false;
    let lastMousePos = { x: 0, y: 0 };

    // Mouse down - start dragging
    canvas.addEventListener('mousedown', (e) => {
        isDragging = true;
        lastMousePos = { x: e.clientX, y: e.clientY };
    });

    // Mouse up - stop dragging
    canvas.addEventListener('mouseup', () => {
        isDragging = false;
    });

    // Mouse leave - stop dragging
    canvas.addEventListener('mouseleave', () => {
        isDragging = false;
    });

    // Mouse move - pan the view
    canvas.addEventListener('mousemove', (e) => {
        if (!isDragging) return;

        const deltaX = e.clientX - lastMousePos.x;
        const deltaY = e.clientY - lastMousePos.y;

        // Convert pixel movement to complex plane movement
        const scale = 2.0 / zoom;
        centre.x -= (deltaX / canvas.width) * scale * aspect_ratio;
        centre.y += (deltaY / canvas.height) * scale;

        lastMousePos = { x: e.clientX, y: e.clientY };
        render();
    });

    // Mouse wheel - zoom in/out
    canvas.addEventListener('wheel', (e) => {
        e.preventDefault();

        // Get mouse position relative to canvas
        const rect = canvas.getBoundingClientRect();
        const mouseX = (e.clientX - rect.left) / canvas.width * 2 - 1;
        const mouseY = -((e.clientY - rect.top) / canvas.height * 2 - 1);

        // Calculate the point in the complex plane under the mouse
        const pointX = centre.x + (mouseX * aspect_ratio) / zoom;
        const pointY = centre.y + mouseY / zoom;

        // Zoom factor
        const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
        zoom *= zoomFactor;

        // Adjust centre to keep the point under the mouse stationary
        centre.x = pointX - (mouseX * aspect_ratio) / zoom;
        centre.y = pointY - mouseY / zoom;

        render();
    });

    // Handle keyboard input to switch fractals
    window.addEventListener('keydown', (e) => {
        const key = parseInt(e.key);
        if (key >= 1 && key <= fractals.length) {
            currentFractalIndex = key - 1;
            
            // Reset view to fractal's default settings
            centre = { ...fractals[currentFractalIndex].centre };
            zoom = fractals[currentFractalIndex].zoom;
            
            // Recreate pipeline with new shader
            createPipeline();
            updateIndicator();
            render();
        }
    });

    // Handle window resize
    window.addEventListener('resize', () => {
        resizeCanvas();
        aspect_ratio = canvas.width / canvas.height;
        render();
    });

    // Initial render
    render();
}

init();