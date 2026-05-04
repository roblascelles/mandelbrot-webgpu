// The "?raw" suffix tells Vite: "Don't execute this, just give me the text."
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

    // Create a command encoder to record instructions
    const commandEncoder = device.createCommandEncoder();
    const textureView = context.getCurrentTexture().createView();

    const renderPassDescriptor = {
        colorAttachments: [{
            view: textureView,
            clearValue: { r: 0.1, g: 0.1, b: 0.1, a: 1.0 }, // Dark gray background
            loadOp: 'clear',
            storeOp: 'store',
        }],
    };

    const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);
    passEncoder.setPipeline(pipeline);
    passEncoder.draw(3); // Draw 3 vertices (our triangle)
    passEncoder.end();

    // Submit the commands to the GPU
    device.queue.submit([commandEncoder.finish()]);
}

init();