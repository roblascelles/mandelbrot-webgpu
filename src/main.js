import shaderSource from './shader.wgsl?raw';

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

    context.configure({
        device: device,
        format: format,
        alphaMode: 'premultiplied',
    });

    const shaderModule = device.createShaderModule({ code: shaderSource });

    // Create uniform buffer for Mandelbrot parameters
    const uniformBufferSize = 4 * 4; // 2 floats (centre) + 1 float (zoom) + 1 float (aspect_ratio) = 16 bytes
    const uniformBuffer = device.createBuffer({
        size: uniformBufferSize,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    // Mandelbrot view parameters
    let centre = { x: -0.5, y: 0.0 };
    let zoom = 1.0;
    const aspect_ratio = canvas.width / canvas.height;

    const pipeline = device.createRenderPipeline({
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

    // Create bind group for uniforms
    const bindGroup = device.createBindGroup({
        layout: pipeline.getBindGroupLayout(0),
        entries: [{
            binding: 0,
            resource: { buffer: uniformBuffer },
        }],
    });

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

    // Initial render
    render();
}

init();